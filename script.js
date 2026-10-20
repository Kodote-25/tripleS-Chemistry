
const table = document.getElementById("chemistryTable");
const modal = document.getElementById("chemistryModal");
const titleElement = document.getElementById("chemistryTitle");
const imageElement = document.getElementById("chemistryImage");
const descriptionElement = document.getElementById("chemistryDescription");
const linksElement = document.getElementById("chemistryLinks");
const closeButton = document.querySelector(".close");

const memberLinks = {
  "윤서연": "https://namu.wiki/w/윤서연",
  "정혜린": "https://namu.wiki/w/정혜린",
  "이지우": "https://namu.wiki/w/이지우(tripleS)",
  "김채연": "https://namu.wiki/w/김채연(tripleS)",
  "김유연": "https://namu.wiki/w/김유연",
  "김수민": "https://namu.wiki/w/김수민(tripleS)",
  "김나경": "https://namu.wiki/w/김나경",
  "공유빈": "https://namu.wiki/w/공유빈",
  "카에데": "https://namu.wiki/w/카에데(tripleS)",
  "서다현": "https://namu.wiki/w/서다현",
  "코토네": "https://namu.wiki/w/코토네(tripleS)",
  "곽연지": "https://namu.wiki/w/곽연지",
  "니엔": "https://namu.wiki/w/니엔",
  "박소현": "https://namu.wiki/w/박소현(tripleS)",
  "신위": "https://namu.wiki/w/신위",
  "마유": "https://namu.wiki/w/마유(tripleS)",
  "린": "https://namu.wiki/w/린(tripleS)",
  "주빈": "https://namu.wiki/w/주빈",
  "정하연": "https://namu.wiki/w/정하연",
  "박시온": "https://namu.wiki/w/박시온",
  "김채원": "https://namu.wiki/w/김채원(tripleS)",
  "설린": "https://namu.wiki/w/설린",
  "서아": "https://namu.wiki/w/서아(tripleS)",
  "지연": "https://namu.wiki/w/지연(tripleS)"
};

const memberIndex = new Map(
  members.map((member, index) => [member.name, index])
);

const chemistryByPair = new Map();

function pairKey(nameA, nameB) {
  return [nameA, nameB]
    .sort((a, b) => memberIndex.get(a) - memberIndex.get(b))
    .join("::");
}

chemistries.forEach(chemistry => {
  chemistryByPair.set(
    pairKey(...chemistry.members),
    chemistry
  );
});

/* 멤버 이름 링크 만들기 */
function createMemberLink(name) {
  const link = document.createElement("a");
  link.className = "member-name-link";
  link.textContent = name;
  link.title = `${name} 나무위키 열기`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";

  const url = memberLinks[name];

  if (url) {
    link.href = url;
  } else {
    link.href = "#";
    link.removeAttribute("target");
    link.title = "나무위키 링크를 찾을 수 없습니다.";
  }

  return link;
}

/* 표 만들기 */
function renderTable() {
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  // 왼쪽 위 로고
  const logoHeader = document.createElement("th");
  logoHeader.textContent = "멤버";
  headerRow.appendChild(logoHeader);

  // 상단 멤버 이름
  members.forEach(member => {
    const th = document.createElement("th");
    th.appendChild(createMemberLink(member.name));
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.replaceChildren(thead);

  const tbody = document.createElement("tbody");

  members.forEach(rowMember => {
    const tr = document.createElement("tr");

    // 왼쪽 멤버 이름
    const rowHeader = document.createElement("th");
    rowHeader.appendChild(createMemberLink(rowMember.name));
    tr.appendChild(rowHeader);

    members.forEach(colMember => {
      const td = document.createElement("td");

      if (rowMember.id === colMember.id) {
        td.className = "diagonal-cell";
        td.textContent = rowMember.name;
      } else {
        const chemistry = chemistryByPair.get(
          pairKey(rowMember.name, colMember.name)
        );

        if (chemistry) {
          td.className = "chemistry-cell";
          td.textContent = chemistry.name.replace(" / ", "\n");
          td.style.whiteSpace = "pre-line";
          td.tabIndex = 0;
          td.setAttribute("role", "button");
          td.setAttribute(
            "aria-label",
            `${rowMember.name}과 ${colMember.name}: ${chemistry.name}`
          );

          const show = () =>
            openChemistry(
              chemistry,
              rowMember.name,
              colMember.name
            );

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

/* 설명에 들어갈 HTML 안전 처리 */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function formatDescription(description, links) {
  let html = String(description || "");
  const tokens = [];

  html = html.replace(/<\/?(?:b|strong|br)\s*\/?>/gi, tag => {
    tokens.push(
      tag.toLowerCase().startsWith("<br")
        ? "<br>"
        : tag.toLowerCase()
    );
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

  html = html.replace(/___SAFEHTML(\d+)___/g, (_, i) => {
    return tokens[Number(i)];
  });

  return html.replace(/\n/g, "<br>");
}

/* 케미 상세 팝업 열기 */
function openChemistry(chemistry, nameA, nameB) {
  titleElement.textContent =
    `${chemistry.name} (${nameA} · ${nameB})`;

  imageElement.onerror = () => {
    imageElement.removeAttribute("src");
    imageElement.alt =
      "이미지를 찾을 수 없습니다. data.js의 image 경로를 확인해 주세요.";
  };

  imageElement.src = chemistry.image || "";
  imageElement.alt = `${chemistry.name} 케미 이미지`;

  const links = chemistry.links || [];

  descriptionElement.innerHTML = formatDescription(
    chemistry.description,
    links
  );

  descriptionElement.hidden = !chemistry.description;

  linksElement.replaceChildren();

  links.forEach(link => {
    if (
      chemistry.description &&
      chemistry.description.includes(`**${link.label}**`)
    ) {
      return;
    }

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

if (closeButton) {
  closeButton.addEventListener("click", closeModal);
}

if (modal) {
  modal.addEventListener("click", event => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeModal();
  }
});

/* 다크모드 */
(() => {
  const toggle = document.getElementById("theme-toggle");

  let savedTheme = "light";

  try {
    savedTheme = localStorage.getItem("theme") || "light";
  } catch (error) {
    // 로컬 저장소를 사용할 수 없어도 사이트 이용 가능
  }

  function updateTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);

    if (toggle) {
      toggle.textContent = isDark
        ? "☀️ 라이트모드"
        : "🌙 다크모드";

      toggle.setAttribute("aria-pressed", String(isDark));
    }

    try {
      localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
      );
    } catch (error) {
      // 테마 저장 실패 시에도 현재 화면은 전환 가능
    }
  }

  updateTheme(savedTheme === "dark");

  if (toggle) {
    toggle.addEventListener("click", () => {
      const isDark =
        !document.body.classList.contains("dark-mode");

      updateTheme(isDark);
    });
  }
})();

/* 표 생성 */
renderTable();
