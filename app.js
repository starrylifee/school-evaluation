(function() {
  "use strict";

  const JSON_PATH = "./학교평가_드롭다운용_grouped.json";

  /**
   * 상태
   */
  const state = {
    data: [],
    // 선택된 대상 (키: 영역||세부영역||평가지표||평가대상자)
    selectedTargets: new Set(),
    // 선택된 문항 (키: 평가대상자||영역||세부영역||평가지표||문항텍스트)
    selectedQuestions: new Set(),
    step: 1,
    // 현재 탭 카테고리 (학생용, 학부모용, 교원용, 직원용)
    currentCategory: "학생용",
  };

  const categories = ["학생용", "학부모용", "교원용", "직원용"];

  // 사용자 지정 표시 순서
  const ORDER = {
    areas: [
      "Ⅰ. 협력적 학교자치문화",
      "Ⅱ. 교육과정 운영 및 교수·학습 방법",
      "Ⅲ. 교육 활동 및 교육 성과",
    ],
    subs: {
      "Ⅰ. 협력적 학교자치문화": [
        "Ⅰ-1. 소통과 협력의 학교자치 기반 조성",
        "Ⅰ-2. 학부모 및 지역사회 연계",
        "Ⅰ-3. 행정·예산",
      ],
      "Ⅱ. 교육과정 운영 및 교수·학습 방법": [
        "Ⅱ-1. 교육과정 편성·운영",
        "Ⅱ-2. 수업·평가 혁신",
        "Ⅱ-3. 교원전문성 신장",
      ],
      "Ⅲ. 교육 활동 및 교육 성과": [
        "Ⅲ-1. 맞춤형 책임교육",
        "Ⅲ-2. 인문·과학·예체능 교육",
        "Ⅲ-3. 민주시민교육",
        "Ⅲ-4. 안전하고 쾌적한 교육환경",
      ],
    },
    kpis: {
      "Ⅰ-1. 소통과 협력의 학교자치 기반 조성": [
        "학교 비전 공유 및 실현",
        "학교자율운영체제 내실화",
        "학교 회의 문화 활성화",
        "서울형 학교조직진단도구(SODI)를 활용한 조직문화 개선",
      ],
      "Ⅰ-2. 학부모 및 지역사회 연계": [
        "학부모의 학교교육 참여 활성화",
        "학교와 지역사회 연계·협력 강화",
      ],
      "Ⅰ-3. 행정·예산": [
        "행정업무 경감 및 효율성 제고",
        "예산 편성·운영의 적정성 및 투명성 제고",
      ],
      "Ⅱ-1. 교육과정 편성·운영": [
        "함께 만들어 가는 학생 맞춤형 교육과정 편성·운영",
        "학사 운영 및 교육과정 내실화",
        "학생 맞춤형 진로교육과정 활성화",
      ],
      "Ⅱ-2. 수업·평가 혁신": [
        "수업혁신 및 수업나눔 문화 확산",
        "학생의 성장과 발달을 돕는 과정중심 평가 내실화",
        "평가의 공정성 제고",
      ],
      "Ⅱ-3. 교원전문성 신장": [
        "자발적 연구문화 조성",
        "교원의 역량 강화 지원",
      ],
      "Ⅲ-1. 맞춤형 책임교육": [
        "기초학력 책임지도 강화",
        "협력적 통합교육 내실화",
        "중단 없는 교육기회 제공",
        "안정적인 교육복지 지원",
        "학생상담 및 치유 회복 지원",
        "늘봄학교 안정적 운영",
      ],
      "Ⅲ-2. 인문·과학·예체능 교육": [
        "독서‧토론‧쓰기교육 활성화",
        "수학‧과학‧융합교육 내실화",
        "인공지능(AI)‧디지털교육 활성화",
        "학교예술 및 학교체육교육 활성화",
        "현장체험학습, 수련활동 및 소규모테마형교육여행 운영 내실화",
      ],
      "Ⅲ-3. 민주시민교육": [
        "학생자치를 통한 민주시민교육 활성화",
        "공동체형 인성교육 내실화",
        "역사‧통일‧다문화‧세계시민교육 활성화",
        "지속가능한 생태전환교육 강화",
        "생명존중‧인권존중‧성평등 학교문화 조성",
        "학교폭력 및 성폭력 예방 및 대응 강화",
      ],
      "Ⅲ-4. 안전하고 쾌적한 교육환경": [
        "체험 중심 안전교육 강화",
        "편리하고 안전한 정보 환경 조성",
        "학교 보건 관리 및 건강한 급식 제공",
        "교육시설 안전 강화",
      ],
    },
  };

  function orderIndex(list, value) {
    const i = Array.isArray(list) ? list.indexOf(value) : -1;
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  }

  function compareArea(a, b) {
    const ai = orderIndex(ORDER.areas, a);
    const bi = orderIndex(ORDER.areas, b);
    if (ai !== bi) return ai - bi;
    return a.localeCompare(b);
  }

  function compareSub(area, aSub, bSub) {
    const list = ORDER.subs[area] || [];
    const ai = orderIndex(list, aSub);
    const bi = orderIndex(list, bSub);
    if (ai !== bi) return ai - bi;
    return aSub.localeCompare(bSub);
  }

  function compareKpi(sub, aKpi, bKpi) {
    const list = ORDER.kpis[sub] || [];
    const ai = orderIndex(list, aKpi);
    const bi = orderIndex(list, bKpi);
    if (ai !== bi) return ai - bi;
    return aKpi.localeCompare(bKpi);
  }

  /** DOM 엘리먼트 */
  const stepperEl = document.querySelector(".stepper");
  const step1Pane = document.getElementById("step-1");
  const step2Pane = document.getElementById("step-2");
  const step3Pane = document.getElementById("step-3");
  const treeContainer = document.getElementById("tree-container");
  const filterInput = document.getElementById("filter-input");
  const expandAllBtn = document.getElementById("expand-all");
  const collapseAllBtn = document.getElementById("collapse-all");
  const toStep2Btn = document.getElementById("to-step-2");
  const backTo1Btn = document.getElementById("back-to-1");
  const toStep3Btn = document.getElementById("to-step-3");
  const backTo2Btn = document.getElementById("back-to-2");
  const nextCategoryBtn = document.getElementById("next-category");
  const downloadBtn = document.getElementById("download-txt");
  const questionsContainer = document.getElementById("questions-container");
  const previewContainer = document.getElementById("preview-container");

  /** 유틸 */
  const keyOf = (area, sub, kpi, target) => [area, sub, kpi, target].join("||");
  const qKeyOf = (target, area, sub, kpi, text) => [target, area, sub, kpi, text.trim()].join("||");

  function saveLocal() {
    try {
      const payload = {
        selectedTargets: Array.from(state.selectedTargets),
        selectedQuestions: Array.from(state.selectedQuestions),
        step: state.step,
        currentCategory: state.currentCategory,
      };
      localStorage.setItem("survey_state", JSON.stringify(payload));
    } catch (e) {}
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem("survey_state");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.selectedTargets)) {
        state.selectedTargets = new Set(parsed.selectedTargets);
      }
      if (Array.isArray(parsed.selectedQuestions)) {
        state.selectedQuestions = new Set(parsed.selectedQuestions);
      }
      if (parsed.step) state.step = parsed.step;
      if (parsed.currentCategory) state.currentCategory = parsed.currentCategory;
    } catch (e) {}
  }

  function setStep(step) {
    state.step = step;
    updateStepper();
    step1Pane.hidden = step !== 1;
    step2Pane.hidden = step !== 2;
    step3Pane.hidden = step !== 3;
    saveLocal();
  }

  function updateStepper() {
    const steps = stepperEl.querySelectorAll(".step");
    steps.forEach((s, idx) => {
      const order = idx + 1;
      s.classList.toggle("active", order === state.step);
    });
    const bars = stepperEl.querySelectorAll(".bar");
    bars.forEach((bar, idx) => {
      const progress = Math.max(0, Math.min(state.step - 1 - idx, 1));
      bar.style.setProperty("--progress", progress);
      bar.style.position = "relative";
      const after = bar.querySelector(":scope::after");
      bar.style.setProperty("--w", `${progress * 100}%`);
      bar.style.setProperty("width", "100%");
      bar.style.setProperty("height", "2px");
      bar.style.background = getComputedStyle(bar).getPropertyValue("background");
      bar.style.setProperty("--primary", getComputedStyle(document.documentElement).getPropertyValue("--primary"));
      bar.style.setProperty("--border", getComputedStyle(document.documentElement).getPropertyValue("--border"));
      bar.style.setProperty("position", "relative");
      bar.style.setProperty("display", "block");
      bar.style.setProperty("overflow", "hidden");
      bar.style.setProperty("outline", "none");
      bar.style.setProperty("borderRadius", "1px");
      bar.style.setProperty("maskImage", "linear-gradient(#000,#000)");
      bar.style.setProperty("-webkit-mask-image", "linear-gradient(#000,#000)");
      bar.style.setProperty("--bar-after-width", `${progress * 100}%`);
      bar.style.setProperty("--bar-after-bg", "var(--primary)");
      bar.style.setProperty("--bar-after-left", "0");
      bar.style.setProperty("--bar-after-top", "0");
      bar.style.setProperty("--bar-after-bottom", "0");
      bar.style.setProperty("--bar-after-position", "absolute");
      // inject dynamic style via inline pseudo emulation
      bar.innerHTML = `<div style="position:absolute;left:0;top:0;bottom:0;background:var(--primary);width:${progress * 100}%"></div>`;
    });
  }

  function buildIndex(data) {
    // 트리 인덱스: 영역 -> 세부영역 -> 평가지표 -> Set(평가대상자)
    const index = new Map();
    for (const item of data) {
      const area = (item["영역"] || "").trim();
      const sub = (item["세부영역"] || "").trim();
      const kpi = (item["평가지표"] || "").trim();
      const target = (item["평가대상자"] || "").trim();
      if (!index.has(area)) index.set(area, new Map());
      const subMap = index.get(area);
      if (!subMap.has(sub)) subMap.set(sub, new Map());
      const kpiMap = subMap.get(sub);
      if (!kpiMap.has(kpi)) kpiMap.set(kpi, new Set());
      kpiMap.get(kpi).add(target);
    }
    return index;
  }

  function renderStep1(filterText = "") {
    const index = buildIndex(state.data);
    const root = document.createElement("div");
    root.className = "tree";

    const f = (filterText || "").trim();
    const hasFilter = f.length > 0;
    const fLower = f.toLowerCase();

    const areas = Array.from(index.keys()).sort(compareArea);
    for (const area of areas) {
      const subMap = index.get(area);
      // 영역
      const areaDetails = document.createElement("details");
      areaDetails.className = "area";
      areaDetails.open = !hasFilter; // 기본 접기, 검색 시 자동 펼침
      const areaSum = document.createElement("summary");
      areaSum.textContent = area;
      areaDetails.appendChild(areaSum);

      const subs = Array.from(subMap.keys()).sort((a, b) => compareSub(area, a, b));
      for (const sub of subs) {
        const kpiMap = subMap.get(sub);
        // 세부영역
        if (hasFilter) {
          const text = `${area} ${sub}`.toLowerCase();
          if (!text.includes(fLower)) {
            // 아래 KPI에서 걸릴 수 있으니 일단 통과, KPI에서 필터링 처리
          } else {
            areaDetails.open = true;
          }
        }
        const sectionDiv = document.createElement("div");
        sectionDiv.className = "section";
        const sectionTitle = document.createElement("div");
        sectionTitle.style.fontWeight = "600";
        sectionTitle.style.marginBottom = "6px";
        sectionTitle.textContent = sub;
        sectionDiv.appendChild(sectionTitle);

        const kpis = Array.from(kpiMap.keys()).sort((a, b) => compareKpi(sub, a, b));
        for (const kpi of kpis) {
          const targets = kpiMap.get(kpi);
          const text = `${area} ${sub} ${kpi}`.toLowerCase();
          if (hasFilter && !text.includes(fLower)) continue;
          areaDetails.open = true; // KPI가 매치되면 펼침
          const kpiRow = document.createElement("div");
          kpiRow.className = "kpi";
          const kpiTitle = document.createElement("div");
          kpiTitle.textContent = kpi;
          kpiTitle.style.fontWeight = "500";
          kpiRow.appendChild(kpiTitle);

          // 고정 열: 학생/학부모/교원/직원 순서로 그리기, 없으면 placeholder
          for (const cat of categories) {
            const cell = document.createElement(targets.has(cat) ? "label" : "div");
            if (targets.has(cat)) {
              cell.className = "chip";
              const id = keyOf(area, sub, kpi, cat);
              const cb = document.createElement("input");
              cb.type = "checkbox";
              cb.checked = state.selectedTargets.has(id);
              cb.addEventListener("change", () => {
                if (cb.checked) state.selectedTargets.add(id); else state.selectedTargets.delete(id);
                saveLocal();
              });
              cell.appendChild(cb);
              const span = document.createElement("span");
              span.textContent = cat.replace("용", "");
              cell.appendChild(span);
            } else {
              cell.className = "placeholder";
              cell.textContent = "-";
            }
            kpiRow.appendChild(cell);
          }
          sectionDiv.appendChild(kpiRow);
        }
        if (sectionDiv.children.length > 1) { // 타이틀 + 1개 이상 KPI
          areaDetails.appendChild(sectionDiv);
        }
      }
      if (areaDetails.children.length > 1) {
        root.appendChild(areaDetails);
      }
    }
    treeContainer.innerHTML = "";
    treeContainer.appendChild(root);
  }

  function renderStep2(category = state.currentCategory) {
    state.currentCategory = category;
    // 탭 상태 반영
    document.querySelectorAll(".tab").forEach(btn => {
      const cat = btn.getAttribute("data-cat");
      btn.setAttribute("aria-selected", String(cat === category));
      btn.addEventListener("click", () => renderStep2(cat));
    });

    // 현재 카테고리에서 선택된 대상 목록 추출
    const selectedKeys = Array.from(state.selectedTargets)
      .filter(k => k.endsWith(`||${category}`))
      .sort((a, b) => {
        const [aArea, aSub, aKpi] = a.split("||");
        const [bArea, bSub, bKpi] = b.split("||");
        const areaCmp = compareArea(aArea, bArea);
        if (areaCmp !== 0) return areaCmp;
        const subCmp = compareSub(aArea, aSub, bSub);
        if (subCmp !== 0) return subCmp;
        return compareKpi(aSub, aKpi, bKpi);
      });
    questionsContainer.innerHTML = "";

    if (selectedKeys.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "선택된 설문대상이 없습니다. 1단계에서 대상을 선택하세요.";
      questionsContainer.appendChild(empty);
      return;
    }

    // 키 -> 해당 아이템(문항목록) 매핑
    const groups = [];
    for (const key of selectedKeys) {
      const [area, sub, kpi, target] = key.split("||");
      const items = state.data.filter(it =>
        (it["영역"]||"").trim() === area &&
        (it["세부영역"]||"").trim() === sub &&
        (it["평가지표"]||"").trim() === kpi &&
        (it["평가대상자"]||"").trim() === target
      );
      const questions = (items[0]?.["평가문항목록"] || []).map(s => (s||"").trim()).filter(Boolean);
      groups.push({ area, sub, kpi, target, questions });
    }

    // 렌더
    for (const g of groups) {
      const groupEl = document.createElement("div");
      groupEl.className = "question-group";
      const header = document.createElement("div");
      header.className = "group-header";
      header.textContent = `[${g.target.replace("용", "")}] ${g.영역 || g.area} > ${g.세부영역 || g.sub} > ${g.평가지표 || g.kpi}`.replace(/undefined/g, "");
      groupEl.appendChild(header);
      const body = document.createElement("div");
      body.className = "group-body";

      if (g.questions.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "문항이 없습니다.";
        body.appendChild(empty);
      } else {
        g.questions.forEach((q, idx) => {
          const row = document.createElement("label");
          row.className = "question";
          const cb = document.createElement("input");
          cb.type = "checkbox";
          const qKey = qKeyOf(g.target, g.area, g.sub, g.kpi, q);
          cb.checked = state.selectedQuestions.has(qKey);
          cb.addEventListener("change", () => {
            if (cb.checked) state.selectedQuestions.add(qKey); else state.selectedQuestions.delete(qKey);
            saveLocal();
          });
          row.appendChild(cb);
          const span = document.createElement("span");
          span.textContent = q;
          row.appendChild(span);
          body.appendChild(row);
        });
      }
      groupEl.appendChild(body);
      questionsContainer.appendChild(groupEl);
    }
  }

  function groupSelectedForPreview() {
    // 미리보기 출력용 구조: target -> area/sub/kpi -> [questions]
    const map = new Map();
    for (const key of state.selectedQuestions) {
      const [target, area, sub, kpi, text] = key.split("||");
      if (!map.has(target)) map.set(target, new Map());
      const t = map.get(target);
      const branchKey = `${area} > ${sub} > ${kpi}`;
      if (!t.has(branchKey)) t.set(branchKey, []);
      t.get(branchKey).push(text);
    }
    return map;
  }

  function renderStep3() {
    previewContainer.innerHTML = "";
    const grouped = groupSelectedForPreview();
    if (grouped.size === 0) {
      const empty = document.createElement("div");
      empty.className = "empty";
      empty.textContent = "선택된 문항이 없습니다. 2단계에서 문항을 선택하세요.";
      previewContainer.appendChild(empty);
      return;
    }

    for (const target of categories) {
      if (!grouped.has(target)) continue;
      const block = document.createElement("div");
      block.className = "preview-block";
      const header = document.createElement("div");
      header.className = "block-header";
      header.textContent = `${target.replace("용", "")}`;
      block.appendChild(header);
      const body = document.createElement("div");
      body.className = "block-body";

      const branches = grouped.get(target);
      const sortedBranches = Array.from(branches.entries()).sort((a, b) => {
        const [aBranch] = a; const [bBranch] = b;
        const [aArea, aSub, aKpi] = aBranch.split(" > ");
        const [bArea, bSub, bKpi] = bBranch.split(" > ");
        const areaCmp = compareArea(aArea, bArea);
        if (areaCmp !== 0) return areaCmp;
        const subCmp = compareSub(aArea, aSub, bSub);
        if (subCmp !== 0) return subCmp;
        return compareKpi(aSub, aKpi, bKpi);
      });
      for (const [branch, qs] of sortedBranches) {
        const g = document.createElement("div");
        g.className = "preview-group";
        const h4 = document.createElement("h4");
        h4.textContent = branch;
        g.appendChild(h4);
        const ul = document.createElement("ul");
        qs.forEach(q => {
          const li = document.createElement("li");
          li.textContent = q;
          ul.appendChild(li);
        });
        g.appendChild(ul);
        body.appendChild(g);
      }
      block.appendChild(body);
      previewContainer.appendChild(block);
    }
  }

  function composeTxt() {
    const grouped = groupSelectedForPreview();
    const lines = [];
    for (const target of categories) {
      if (!grouped.has(target)) continue;
      lines.push(`[${target.replace("용", "")}]`);
      const branches = grouped.get(target);
      for (const [branch, qs] of branches) {
        lines.push(`- ${branch}`);
        for (const q of qs) {
          lines.push(`  · ${q}`);
        }
        lines.push("");
      }
      lines.push("");
    }
    return lines.join("\n").trim() + "\n";
  }

  function handleDownload() {
    const txt = composeTxt();
    if (!txt || txt.trim().length === 0) {
      alert("다운로드할 문항이 없습니다.");
      return;
    }
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `학교평가_설문지_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /** 이벤트 바인딩 */
  function bindEvents() {
    filterInput.addEventListener("input", () => {
      renderStep1(filterInput.value);
    });
    expandAllBtn.addEventListener("click", () => {
      document.querySelectorAll(".tree details").forEach(d => d.open = true);
    });
    collapseAllBtn.addEventListener("click", () => {
      document.querySelectorAll(".tree details").forEach(d => d.open = false);
    });

    toStep2Btn.addEventListener("click", () => {
      if (state.selectedTargets.size === 0) {
        alert("최소 1개 이상의 설문대상을 선택하세요.");
        return;
      }
      setStep(2);
      renderStep2(state.currentCategory);
    });
    backTo1Btn.addEventListener("click", () => setStep(1));

    toStep3Btn.addEventListener("click", () => {
      if (state.selectedQuestions.size === 0) {
        alert("최소 1개 이상의 문항을 선택하세요.");
        return;
      }
      setStep(3);
      renderStep3();
    });
    backTo2Btn.addEventListener("click", () => {
      setStep(2);
      renderStep2(state.currentCategory);
    });

    nextCategoryBtn.addEventListener("click", () => {
      const idx = categories.indexOf(state.currentCategory);
      const next = categories[(idx + 1) % categories.length];
      renderStep2(next);
    });

    downloadBtn.addEventListener("click", handleDownload);
  }

  async function bootstrap() {
    loadLocal();
    try {
      const res = await fetch(JSON_PATH);
      const json = await res.json();
      if (!Array.isArray(json)) throw new Error("JSON 형식 오류");
      state.data = json;
    } catch (e) {
      console.error(e);
      treeContainer.innerHTML = `<div class="empty">JSON을 불러오는 중 오류가 발생했습니다. 파일 경로를 확인하세요.<br>${JSON_PATH}</div>`;
      return;
    }

    bindEvents();
    updateStepper();
    renderStep1();
    if (state.step === 2) {
      setStep(2);
      renderStep2(state.currentCategory);
    } else if (state.step === 3) {
      setStep(3);
      renderStep3();
    }
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})();


