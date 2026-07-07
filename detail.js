const detailRoot = byId("detailPage");
const params = new URLSearchParams(window.location.search);
const activityId = params.get("id");
const activity = activities.find((item) => item.id === activityId);

function listItems(items) {
  return (items || []).map((item) => `<li>${item}</li>`).join("");
}

function renderTags(items) {
  return (items || []).map((tag) => `<span class="tag">${tag}</span>`).join("");
}

function galleryImages(item) {
  return unique(item.imageGallery || []).filter(Boolean).slice(0, 6);
}

const completenessFields = [
  { key: "source", label: "来源链接", done: (item) => isUsableSource(item.source) },
  { key: "date", label: "时间", done: (item) => Boolean(item.dateText || item.startDate) },
  { key: "venue", label: "场馆", done: (item) => Boolean(item.venue && !item.venue.includes("待")) },
  { key: "host", label: "主办方", done: (item) => Boolean(item.host && !item.host.includes("待")) },
  { key: "agenda", label: "议程/主题", done: (item) => Boolean(item.contentSections?.length || item.sourceFacts?.length) },
  { key: "brands", label: "品牌/嘉宾", done: (item) => Boolean(item.representativeBrands?.length && !item.representativeBrands.join("").includes("待")) },
  { key: "ticket", label: "票务/报名", done: (item) => Boolean(item.ticketInfo && !item.ticketInfo.includes("待补充") && !item.ticketInfo.includes("以") ) }
];

function confirmedSections(item) {
  if (item.contentSections?.length) return item.contentSections;
  return [{ title: "基础摘要", body: item.summary || "当前仅完成基础字段入库，尚未抓到可展开引用的官方介绍。" }];
}

function completionData(item) {
  const fields = completenessFields.map((field) => ({ ...field, isDone: field.done(item) }));
  const hiddenMissingLabels = new Set(["官方图片", "官方现场图片"]);
  const missing = unique([...(item.missingFields || []), ...fields.filter((field) => !field.isDone).map((field) => field.label)])
    .filter((label) => !hiddenMissingLabels.has(label));
  return {
    fields,
    missing,
    score: Math.round((fields.filter((field) => field.isDone).length / fields.length) * 100)
  };
}

function fieldValue(value, emptyText = "待补充") {
  if (Array.isArray(value)) return value.length ? value.join("；") : emptyText;
  return value || emptyText;
}

function renderFieldValue(field) {
  const value = field.html || field.value;
  if (value === undefined || value === null || value === "" || value === "undefined") return "待补充";
  return value;
}

function structuredFields(item) {
  const data = completionData(item);
  const fieldStatus = Object.fromEntries(data.fields.map((field) => [field.key, field.isDone]));
  return {
    score: data.score,
    fields: [
      { key: "source", label: "来源链接", value: isUsableSource(item.source) ? `<a class="source-link" href="${item.source}" target="_blank" rel="noopener noreferrer">${item.sourceLabel || item.sourceType || "打开原始链接"}</a>` : "待补充可打开来源", done: fieldStatus.source },
      { key: "nextEdition", label: "下届追踪", value: hasNextEditionLead(item) ? renderNextEditionText(item) : "待补充下届排期", done: hasNextEditionLead(item) },
      { key: "date", label: "时间", value: renderDateText(item), done: fieldStatus.date },
      { key: "openHours", label: "开闭馆时间", value: item.openHours, done: Boolean(item.openHours) },
      { key: "frequency", label: "举办周期", value: item.frequency, done: Boolean(item.frequency) },
      { key: "venue", label: "城市/场馆", value: `${item.city || "待补充"} · ${item.venue || "待补充"}`, done: fieldStatus.venue },
      { key: "address", label: "场馆地址", value: item.venueAddress, done: Boolean(item.venueAddress) },
      { key: "host", label: "主办方", value: item.host, done: fieldStatus.host },
      { key: "scale", label: "规模", value: item.scale, done: Boolean(item.scale && !item.scale.includes("待补充")) },
      { key: "ticket", label: "票务/报名", value: item.ticketInfo, done: fieldStatus.ticket },
      { key: "rating", label: "评分/热度", value: [item.rating ? `评分${item.rating}` : "", item.viewCount || ""].filter(Boolean).join("；"), done: Boolean(item.rating || item.viewCount) },
      { key: "participation", label: "参会方式", value: item.participation, done: Boolean(item.participation && !item.participation.includes("待补充")) },
      { key: "audience", label: "与会人群", value: fieldValue(item.audience), done: Boolean(item.audience?.length) },
      { key: "highlights", label: "亮点", value: fieldValue(item.highlights), done: Boolean(item.highlights?.length) },
      { key: "brands", label: "品牌/嘉宾", value: fieldValue(item.representativeBrands), done: fieldStatus.brands },
      { key: "roles", label: "关键岗位", value: fieldValue(item.attendeeRoles), done: Boolean(item.attendeeRoles?.length) },
      { key: "industries", label: "匹配行业", value: fieldValue(item.industries), done: Boolean(item.industries?.length) },
      { key: "status", label: "活动状态", value: item.status, done: Boolean(item.status && item.status !== "待确认") },
      { key: "rank", label: "活动等级", value: `${item.rank}级 · ${item.type}`, done: Boolean(item.rank && item.type) },
      { key: "media", label: "公众号/媒体线索", value: fieldValue(item.mediaAccounts), done: Boolean(item.mediaAccounts?.length && !item.mediaAccounts.join("").includes("待补充")) },
      { key: "agenda", label: "议程/主题", value: item.contentSections?.map((section) => section.title).join("；") || "待补充官方议程", done: fieldStatus.agenda }
    ],
    missing: data.missing
  };
}

function listSection(title, items, emptyText) {
  const values = unique(items || []);
  if (!values.length) {
    return `<div class="content-block muted-block"><h3>${title}</h3><p>${emptyText}</p></div>`;
  }
  return `<div class="content-block"><h3>${title}</h3><ul class="clean-list">${listItems(values)}</ul></div>`;
}

function renderStructuredModule(item) {
  const data = structuredFields(item);
  return `
    <section class="section detail-structured" id="content">
      <div class="section-head compact">
        <div class="section-title-line">
          <p class="eyebrow">Structured</p>
          <h2>1. 信息介绍</h2>
        </div>
        <span class="section-note">信息完整度 ${data.score}% · 绿色为已有信息，灰色为待补字段</span>
      </div>
      <div class="structured-grid">
        ${data.fields.map((field) => `
          <article class="structured-field ${field.done ? "confirmed" : "missing"}">
            <div>
              <h3>${field.label}</h3>
            </div>
            <p>${renderFieldValue(field)}</p>
          </article>
        `).join("")}
      </div>
      ${data.missing.length ? `
        <div class="missing-summary">
          <strong>仍需补充</strong>
          <ul class="clean-list">${listItems(data.missing)}</ul>
        </div>
      ` : ""}
    </section>
  `;
}

function renderNextEditionSection(item) {
  if (!hasNextEditionLead(item)) return "";
  const next = item.nextEdition;
  const link = next.relatedId
    ? `<a class="source-link" href="detail.html?id=${next.relatedId}" target="_blank" rel="noopener">查看库内未来档期</a>`
    : (isUsableSource(next.source) ? `<a class="source-link" href="${next.source}" target="_blank" rel="noopener noreferrer">${next.sourceLabel || "打开追踪来源"}</a>` : "");
  return `
    <div class="content-block next-edition-block">
      <h3>下届追踪</h3>
      <p>${renderNextEditionText(item)}</p>
      <p>${next.trackingNote || "建议继续补充下一届排期、主办方公告、报名入口和参展品牌名单。"}</p>
      ${link ? `<p>${link}</p>` : ""}
    </div>
  `;
}

function renderImageCaption(item, index) {
  if (item.officialImageCredit) return `${item.officialImageCredit} · 图 ${index + 1}`;
  return "行业场景图，官方现场图待补";
}

function relatedActivities(current) {
  return activities
    .filter((item) => item.id !== current.id)
    .map((item) => {
      const industryOverlap = item.industries.filter((tag) => current.industries.includes(tag)).length;
      const cityScore = item.city === current.city ? 2 : 0;
      const historyScore = item.status === "历史" ? 1 : 0;
      return { item, score: industryOverlap * 3 + cityScore + historyScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ item }) => item);
}

function sameIndustryHistory(current) {
  return activities
    .filter((item) => item.id !== current.id && item.status === "历史")
    .filter((item) => item.industries.some((tag) => current.industries.includes(tag)))
    .slice(0, 6);
}

function commercialText(item) {
  if (item.isHeadline) {
    return "内部判断：可作为头部专题候选，适合承接活动专题曝光、会前品牌线索收集、活动后复盘报告等商业化尝试。";
  }
  return "内部判断：可作为普通情报收录，优先补齐主办方、参会品牌和官方图文后，再进入BD跟进池。";
}

function renderRelatedCard(item) {
  return `
    <article class="related-card ${item.image ? "" : "no-image"}">
      ${item.image ? renderLazyImage("related-thumb", item) : ""}
      <div>
        <div class="event-title-row">
          <h3>${item.title}</h3>
          <span class="tag">${item.rank}级</span>
          <span class="tag">${item.status}</span>
        </div>
        <div class="card-meta">${item.city} · ${renderDateText(item)} · ${item.sourceType}</div>
        <p>${item.leadAngle}</p>
        <a class="text-link" href="detail.html?id=${item.id}" target="_blank" rel="noopener">查看详情</a>
      </div>
    </article>
  `;
}

function renderDetailPage(item) {
  document.title = `${item.title} · 活动详情`;
  const related = relatedActivities(item);
  const history = sameIndustryHistory(item);
  const heroImage = renderLazyImage("", item);
  const gallery = galleryImages(item);
  detailRoot.innerHTML = `
    <section class="detail-page-hero">
      ${heroImage ? `<div class="detail-page-image">${heroImage}</div>` : ""}
      <div class="detail-page-intro">
        <div class="event-title-row">
          <span class="rank ${item.rank === "A" ? "a" : ""}">${item.rank}级活动</span>
          <span class="status ${statusClass(item.status)}">${item.status}</span>
          <span class="tag">${item.type}</span>
          ${item.isNew ? `<span class="tag">新增</span>` : ""}
        </div>
        <h1>${item.title}</h1>
        <p>${item.summary}</p>
        <div class="detail-meta-grid">
          <div><strong>城市/场馆</strong><span>${item.city} · ${item.venue}</span></div>
          <div><strong>时间</strong><span>${renderDateText(item)}</span></div>
          <div><strong>主办方</strong><span>${item.host}</span></div>
          <div><strong>来源</strong><span>${item.sourceType} · ${item.sourceConfidence}可信${isUsableSource(item.source) ? ` · <a class="source-link inline" href="${item.source}" target="_blank" rel="noopener noreferrer">原始链接</a>` : ""}</span></div>
        </div>
        <div class="tag-row">${renderTags(item.industries)}${renderTags(item.brands)}</div>
      </div>
    </section>

    ${renderStructuredModule(item)}

    <section class="section detail-story">
      <div class="section-head compact">
        <div class="section-title-line">
          <p class="eyebrow">Story</p>
          <h2>2. 完整大图文介绍</h2>
        </div>
        <span class="section-note">官方图文不足时明确标注待补</span>
      </div>
      <div class="story-layout">
        <article class="detail-main">
          <section class="detail-section">
            <h2>活动内容介绍</h2>
          ${confirmedSections(item).map((section) => `
            <div class="content-block">
              <h3>${section.title}</h3>
              <p>${section.body}</p>
            </div>
          `).join("")}
          ${renderNextEditionSection(item)}
          ${listSection("已抓到的来源事实", item.sourceFacts, "暂无逐条来源事实，需继续补抓官方网页、公众号正文或活动行页面。")}
          ${listSection("展品范围", item.exhibitScope, "暂无展品范围，需要继续补抓官方展品分类。")}
          ${listSection("展商调研", item.exhibitorResearch, "暂无展商调研数据，需要继续补抓官方报告或展会复盘。")}
        </section>

          ${gallery.length ? `
            <section class="detail-section">
            <h2>图文资料</h2>
            <div class="detail-gallery">
              ${gallery.map((src, index) => `
                <figure>
                  <img src="${imagePlaceholder}" data-src="${src}" alt="${item.title} 图文资料 ${index + 1}" loading="lazy" decoding="async" referrerpolicy="no-referrer">
                  <figcaption>${renderImageCaption(item, index)}</figcaption>
                </figure>
              `).join("")}
            </div>
          </section>
          ` : ""}

          <section class="detail-section">
            <h2>LHB内部判断</h2>
            ${listSection("业务判断依据", item.lhbNotes, "暂无逐条业务判断，先以行业、城市、主办方和活动类型做初筛。")}
            <div class="strategy-grid">
              <div><strong>推荐产品</strong><ul>${listItems(item.fitProducts)}</ul></div>
              <div><strong>建议参会BU</strong><ul>${listItems(item.buSuggestion)}</ul></div>
              <div><strong>目标客户</strong><ul>${listItems(item.representativeBrands)}</ul></div>
              <div><strong>可验证切口</strong><p>${item.leadAngle}</p></div>
            </div>
          </section>

          <section class="detail-section">
            <h2>商业化假设</h2>
            <p>${commercialText(item)}</p>
            <ul class="clean-list">
              <li>前置条件：必须补全官方议程、嘉宾/品牌名单、报名入口或活动方联系方式。</li>
              <li>会中核验：记录品牌线下需求、展位形态、活动合作入口和关键联系人。</li>
              <li>会后沉淀：形成行业复盘、品牌线索表和下一次活动跟进计划。</li>
            </ul>
          </section>
        </article>

      </div>
    </section>

    <section class="section" id="related">
      <div class="section-head compact">
        <div class="section-title-line">
          <p class="eyebrow">Recommend</p>
          <h2>3. 其他推荐</h2>
        </div>
        <span class="section-note">同城、同行业、历史活动优先</span>
      </div>
      <div class="related-grid">
        ${(history.length ? history : related).map(renderRelatedCard).join("") || `<div class="empty">暂无足够相关活动，后续抓取后补充。</div>`}
      </div>
    </section>
  `;
  hydrateImages(detailRoot);
}

if (!activity) {
  detailRoot.innerHTML = `
    <div class="empty">
      没有找到对应活动。请回到首页重新打开详情。
      <br><br><a class="text-link" href="index.html">返回首页</a>
    </div>
  `;
} else {
  renderDetailPage(activity);
}
