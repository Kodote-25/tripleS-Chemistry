const table = document.getElementById("chemistryTable");
const modal = document.getElementById("chemistryModal");
const titleElement = document.getElementById("chemistryTitle");
const imageElement = document.getElementById("chemistryImage");
const descriptionElement = document.getElementById("chemistryDescription");
const linksElement = document.getElementById("chemistryLinks");
const closeButton = document.querySelector(".close");

const memberLinks = {
  "윤서연": "https://namu.wiki/w/%EC%9C%A4%EC%84%9C%EC%97%B0",
  "정혜린": "https://namu.wiki/w/%EC%A0%95%ED%98%9C%EB%A6%B0",
  "이지우": "https://namu.wiki/w/%EC%9D%B4%EC%A7%80%EC%9A%B0(tripleS)",
  "김채연": "https://namu.wiki/w/%EA%B9%80%EC%B1%84%EC%97%B0(tripleS)",
  "김유연": "https://namu.wiki/w/%EA%B9%80%EC%9C%A0%EC%97%B0",
  "김수민": "https://namu.wiki/w/%EA%B9%80%EC%88%98%EB%AF%BC(tripleS)",
  "김나경": "https://namu.wiki/w/%EA%B9%80%EB%82%98%EA%B2%BD",
  "공유빈": "https://namu.wiki/w/%EA%B3%B5%EC%9C%A0%EB%B9%88",
  "카에데": "https://namu.wiki/w/%EC%B9%B4%EC%97%90%EB%8D%B0(tripleS)",
  "서다현": "https://namu.wiki/w/%EC%84%9C%EB%8B%A4%ED%98%84",
  "코토네": "https://namu.wiki/w/%EC%BD%94%ED%86%A0%EB%84%A4(tripleS)",
  "곽연지": "https://namu.wiki/w/%EA%B3%BD%EC%97%B0%EC%A7%80",
  "니엔": "https://namu.wiki/w/%EB%8B%88%EC%97%94",
  "박소현": "https://namu.wiki/w/%EB%B0%95%EC%86%8C%ED%98%84(tripleS)",
  "신위": "https://namu.wiki/w/%EC%8B%A0%EC%9C%84",
  "마유": "https://namu.wiki/w/%EB%A7%88%EC%9C%A0(tripleS)",
  "린": "https://namu.wiki/w/%EB%A6%B0(tripleS)",
  "주빈": "https://namu.wiki/w/%EC%A3%BC%EB%B9%88",
  "정하연": "https://namu.wiki/w/%EC%A0%95%ED%95%98%EC%97%B0",
  "박시온": "https://namu.wiki/w/%EB%B0%95%EC%8B%9C%EC%98%A8",
  "김채원": "https://namu.wiki/w/%EA%B9%80%EC%B1%84%EC%9B%90(tripleS)",
  "설린": "https://namu.wiki/w/%EC%84%A4%EB%A6%B0",
  "서아": "https://namu.wiki/w/%EC%84%9C%EC%95%84(tripleS)",
  "지연": "https://namu.wiki/w/%EC%A7%80%EC%97%B0(tripleS)"
};

const memberIndex = new Map(members.map((member, index) => [member.name, index]));
const chemistryByPair = new Map();

function pairKey(nameA, nameB) {
  return [nameA, nameB]
    .sort((a, b) => memberIndex.get(a) - memberIndex.get(b))
    .join("::");
}

chemistries.forEach(chemistry => {
  chemistryByPair.set(pairKey(...chemistry.members), chemistry);
});

function renderTable() {
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  const logoHeader = document.createElement("th");
  const mainLogo = document.createElement("img");
  mainLogo.src = "Logo_of_tripleS.png";
  mainLogo.alt = "tripleS 로고";
  logoHeader.appendChild(mainLogo);
  headerRow.appendChild(logoHeader);

  members.forEach(member => {
    const th = document.createElement("th");
    const img = document.createElement("img");
    img.src = member.topImage;
    img.alt = member.name;
    img.className = "member-image";
    img.title = `${member.name} 나무위키 열기`;
    img.addEventListener("click", () => openMemberWiki(member.name));
    th.appendChild(img);
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.replaceChildren(thead);

  const tbody = document.createElement("tbody");
  members.forEach(rowMember => {
    const tr = document.createElement("tr");

    const rowHeader = document.createElement("th");
    const rowImg = document.createElement("img");
    rowImg.src = rowMember.sideImage;
    rowImg.alt = rowMember.name;
    rowImg.className = "member-image";
    rowImg.title = `${rowMember.name} 나무위키 열기`;
    rowImg.addEventListener("click", () => openMemberWiki(rowMember.name));
    rowHeader.appendChild(rowImg);
    tr.appendChild(rowHeader);

    members.forEach(colMember => {
      const td = document.createElement("td");

      if (rowMember.id === colMember.id) {
        td.className = "diagonal-cell";
        const logoImg = document.createElement("img");
        logoImg.src = rowMember.logoImage;
        logoImg.alt = `S${rowMember.id}`;
        td.appendChild(logoImg);
      } else {
        const chemistry = chemistryByPair.get(pairKey(rowMember.name, colMember.name));
        if (chemistry) {
          td.className = "chemistry-cell";
          td.textContent = chemistry.name.replace(" / ", "\n");
          td.style.whiteSpace = "pre-line";
          td.tabIndex = 0;
          td.setAttribute("role", "button");
          td.setAttribute("aria-label", `${rowMember.name}과 ${colMember.name}: ${chemistry.name}`);
          const show = () => openChemistry(chemistry, rowMember.name, colMember.name);
          td.addEventListener("click", show);
          td.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              show();
            }
          });
        } else {
          td.className = "empty-cell";
        }
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

function openMemberWiki(name) {
  const url = memberLinks[name];
  if (url) window.open(url, "_blank", "noopener,noreferrer");
}

function formatDescription(description, links) {
  let html = String(description || "");
  const tokens = [];

  // 원본 설명에서 사용한 <br>, <b>, <strong>만 HTML 태그로 유지합니다.
  html = html.replace(/<\/?(?:b|strong|br)\s*\/?>/gi, tag => {
    tokens.push(tag.toLowerCase().startsWith("<br") ? "<br>" : tag.toLowerCase());
    return `___SAFEHTML${tokens.length - 1}___`;
  });

  html = escapeHtml(html);

  html = html.replace(/\*\*(.*?)\*\*/g, (match, text) => {
    const linked = (links || []).find(link => link.label === text);
    if (linked) {
      return `<a href="${escapeAttribute(linked.url)}" target="_blank" rel="noopener noreferrer" class="highlight">${escapeHtml(text)}</a>`;
    }
    return `<span class="highlight">${escapeHtml(text)}</span>`;
  });

  html = html.replace(/___SAFEHTML(\d+)___/g, (_, i) => tokens[Number(i)]);
  return html.replace(/\n/g, "<br>");
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
function escapeAttribute(value) { return escapeHtml(value); }

function openChemistry(chemistry, nameA, nameB) {
  titleElement.textContent = `${chemistry.name} (${nameA} · ${nameB})`;

  imageElement.onerror = () => {
    imageElement.removeAttribute("src");
    imageElement.alt = "이미지를 찾을 수 없습니다. data.js의 image 경로를 확인해 주세요.";
  };
  imageElement.src = chemistry.image || "";
  imageElement.alt = `${chemistry.name} 케미 이미지`;

  const links = chemistry.links || [];
  descriptionElement.innerHTML = formatDescription(chemistry.description, links);
  descriptionElement.hidden = !chemistry.description;

  linksElement.replaceChildren();
  links.forEach(link => {
    // Links already embedded in bold description text are not repeated below.
    if (chemistry.description && chemistry.description.includes(`**${link.label}**`)) return;
    const a = document.createElement("a");
    a.href = link.url;
    a.textContent = link.label;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    linksElement.appendChild(a);
  });

  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
}
if (closeButton) closeButton.addEventListener("click", closeModal);
modal.addEventListener("click", event => {
  if (event.target === modal) closeModal();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

renderTable();

 // 다크모드 전환 및 설정 저장
(() => {
  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  let savedTheme = "light";

  try {
    savedTheme = localStorage.getItem("theme") || "light";
  } catch (error) {
    // 저장 기능을 사용할 수 없어도 전환 가능
  }

  function updateTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);

    toggle.textContent = isDark
      ? "☀️ 라이트모드"
      : "🌙 다크모드";

    toggle.setAttribute("aria-pressed", String(isDark));

    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (error) {
      // 저장하지 못해도 현재 페이지에서는 전환 가능
    }
  }

  // 저장된 테마 적용
  updateTheme(savedTheme === "dark");

  // 버튼 클릭 시 테마 전환
  toggle.addEventListener("click", () => {
    const isDark = !document.body.classList.contains("dark-mode");
    updateTheme(isDark);
  });
})();
