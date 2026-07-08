const imagePlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' fill='%23edf2f7'/%3E%3Cpath d='M0 310h640v110H0z' fill='%23dbe7ef'/%3E%3Ccircle cx='515' cy='96' r='42' fill='%23cbd8e3'/%3E%3Cpath d='M72 288l118-126 82 86 62-68 150 108H72z' fill='%23b8c8d6'/%3E%3C/svg%3E";

const priorityCities = ["上海", "杭州", "广州", "深圳", "北京"];
const priorityIndustries = [
  "运动户外",
  "香氛",
  "美妆",
  "潮玩",
  "IP类",
  "鞋服",
  "商场",
  "3C数码",
  "茶饮连锁",
  "食品饮料",
  "家居家装",
  "宠物",
  "母婴",
  "汽车"
];
const prioritySources = ["聚展网", "活动行", "官网/公开网页", "公众号/行业媒体", "本地参考表", "待核验"];

const byId = (id) => document.getElementById(id);
const unique = (items) => [...new Set(items)].filter(Boolean);
const prioritySort = (values, priority) => [
  ...priority.filter((item) => values.includes(item)),
  ...values.filter((item) => !priority.includes(item)).sort()
];
const formatDate = (date) => date.replaceAll("-", ".");
const todayValue = 20260708;
const upcomingWindowDays = 45;
const dateValue = (date) => date ? Number(date.replaceAll("-", "")) : null;
const dateFromValue = (value) => {
  const text = String(value);
  return new Date(`${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}T00:00:00+08:00`);
};
const daysUntil = (date) => Math.ceil((dateFromValue(dateValue(date)) - dateFromValue(todayValue)) / 86400000);
const renderDateText = (activity) => {
  if (activity.dateText) return activity.dateText;
  if (activity.startDate && activity.endDate && activity.startDate !== activity.endDate) {
    return `${formatDate(activity.startDate)} - ${formatDate(activity.endDate)}`;
  }
  if (activity.startDate) return formatDate(activity.startDate);
  return "待确认";
};
const isUsableSource = (source) => source && source !== "待核验" && source !== "待补充" && !source.endsWith(".xlsx");
const renderSourceText = (activity) => (
  isUsableSource(activity.source)
    ? `${activity.sourceLabel || "来源"}<br><a href="${activity.source}" target="_blank" rel="noreferrer">打开来源</a>`
    : `${activity.sourceLabel || "待补充"}<br><span>暂无可打开来源，需继续核验。</span>`
);
const renderLazyImage = (className, activity) => (
  activity?.image
    ? `<img class="${className}" src="${imagePlaceholder}" data-src="${activity.image}" alt="${activity.imageAlt || ""}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`
    : ""
);

const nextEditionLeads = {
  "evt-013": {
    title: "AWE中国家电及消费电子博览会下一届",
    dateText: "建议持续跟踪每年3月上海档期",
    city: "上海",
    sourceLabel: "AWE官网",
    source: "https://www.awe.com.cn/",
    trackingNote: "家电、3C、智能家居品牌密度高，适合提前跟进体验展台、品牌快闪和线下新品体验合作。"
  },
  "evt-019": {
    title: "深圳家居设计周/深圳家具展下一届",
    dateText: "已在库内记录 2027.03.15 未来档期",
    city: "深圳",
    relatedId: "evt-044",
    sourceLabel: "聚展网/本地参考表",
    trackingNote: "与深圳家居、家具和设计品牌高度相关，适合提前筛选参展品牌、装企和家居渠道。"
  },
  "evt-020": {
    title: "CIFF中国国际家具博览会（广州）下一届",
    dateText: "建议持续跟踪每年3月广州档期",
    city: "广州",
    sourceLabel: "本地参考表/CIFF官方渠道待补",
    trackingNote: "家居家装、设计装饰与卖场合作价值高，历史参展品牌可作为下届优先跟进清单。"
  },
  "evt-022": {
    title: "CHIC上海国际服装服饰展下一届",
    dateText: "已在库内记录 2027.03.10 未来档期",
    city: "上海",
    relatedId: "evt-030",
    sourceLabel: "聚展网/本地参考表",
    trackingNote: "鞋服、运动户外和商场品牌集中，适合提前跟进品牌快闪、城市首店和渠道合作。"
  },
  "evt-023": {
    title: "杭州零售供应链展下一届",
    dateText: "建议跟踪下一届秋季档期",
    city: "杭州",
    sourceLabel: "本地参考表",
    trackingNote: "便利店、食品饮料、零售供应链与渠道选品高度相关，适合形成杭州零售线索池。"
  },
  "evt-035": {
    title: "上海服装定制/服饰配饰相关下一届",
    dateText: "已在库内记录 2027.03.22 服饰配饰未来档期",
    city: "上海",
    relatedId: "evt-034",
    sourceLabel: "聚展网",
    trackingNote: "可用历史活动沉淀鞋服品牌名单，并跟进下一届服饰配饰展的线下体验与快闪需求。"
  },
  "evt-046": {
    title: "深圳玩具及潮玩展下一届",
    dateText: "建议跟踪下一届4月深圳档期",
    city: "深圳",
    sourceLabel: "聚展网",
    trackingNote: "潮玩、IP和母婴品牌匹配度高，适合提前关注IP授权、商场快闪和联名活动机会。"
  },
  "evt-056": {
    title: "广州零售商业智能设备及商品博览会下一届",
    dateText: "建议跟踪下一届春季档期",
    city: "广州",
    sourceLabel: "聚展网",
    trackingNote: "零售设备、便利店和3C数字化场景可服务可计算开店与线下运营解决方案。"
  },
  "evt-066": {
    title: "CCFA购物中心与奥特莱斯发展大会下一届",
    dateText: "建议跟踪2027年CCFA年度排期",
    city: "待确认",
    sourceLabel: "CCFA/公众号渠道",
    trackingNote: "购物中心和奥莱资源与LHB场地、品牌活动、招商合作高度相关，应作为年度重点追踪。"
  },
  "evt-076": {
    title: "刀法品牌增长线下大会下一届",
    dateText: "建议跟踪刀法年度品牌增长活动",
    city: "待确认",
    sourceLabel: "刀法研究所/本地参考表",
    trackingNote: "品牌增长类活动适合接触新消费品牌、市场负责人和品牌服务商，适合做商业化曝光与线索合作。"
  }
};

function hasNextEditionLead(activity) {
  return Boolean(activity.nextEdition?.title || activity.nextEdition?.dateText || activity.nextEdition?.trackingNote);
}

function renderNextEditionText(activity) {
  if (!hasNextEditionLead(activity)) return "";
  const next = activity.nextEdition;
  return `${next.title || "下届活动追踪"} · ${next.dateText || "时间待确认"}${next.city ? ` · ${next.city}` : ""}`;
}

function hydrateImages(root = document) {
  const nodes = root.querySelectorAll("img[data-src]");
  const load = (img) => {
    if (!img.dataset.src) return;
    img.src = img.dataset.src;
    img.removeAttribute("data-src");
  };
  nodes.forEach((img) => {
    img.referrerPolicy = "no-referrer";
    if (img.getBoundingClientRect().top < window.innerHeight + 600) load(img);
  });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          load(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "200px" });
    root.querySelectorAll("img[data-src]").forEach((img) => observer.observe(img));
    return;
  }
  root.querySelectorAll("img[data-src]").forEach(load);
}

function statusClass(status) {
  if (status === "历史") return "closed";
  if (status === "筹备中") return "planned";
  return "";
}

function computedStatus(activity) {
  if (!activity.startDate) return "待确认";
  const start = dateValue(activity.startDate);
  const end = dateValue(activity.endDate || activity.startDate);
  if (end < todayValue) return "历史";
  if (start <= todayValue && end >= todayValue) return "进行中";
  return daysUntil(activity.startDate) <= upcomingWindowDays ? "即将开始" : "筹备中";
}

function applyActivityDefaults(activity) {
  activity.audience ||= activity.brands || [];
  activity.attendeeRoles ||= ["品牌负责人", "市场负责人", "渠道负责人"];
  activity.representativeBrands ||= activity.brands || [];
  activity.scale ||= "待补充";
  activity.ticketInfo ||= "待补充";
  activity.participation ||= "建议参观并补充品牌名单";
  activity.buSuggestion ||= activity.fitProducts || [];
  activity.leadAngle ||= `优先用${(activity.fitProducts || []).slice(0, 3).join("、") || "线下活动合作"}切入，关注${(activity.brands || []).slice(0, 3).join("、") || "品牌方"}的线下体验、首店测试或场景合作需求。`;
  activity.mediaAccounts ||= ["待补充公众号/行业媒体"];
  activity.sourceType ||= activity.source === "待核验" ? "待核验" : "官网/公开网页";
  activity.sourceConfidence ||= activity.source === "待核验" ? "低" : "中";
  activity.nextEdition ||= nextEditionLeads[activity.id];
  activity.rawStatus ||= activity.status;
  activity.status = computedStatus(activity);
  activity.updatedAt ||= "2026-06-27";
}

const activities = [
  {
    id: "evt-001",
    title: "中国国际进口博览会",
    city: "上海",
    venue: "国家会展中心（上海）",
    type: "展会",
    rank: "S",
    status: "即将开始",
    startDate: "2026-11-05",
    endDate: "2026-11-10",
    industries: ["商场", "食品饮料", "美妆", "3C数码", "珠宝奢侈品"],
    brands: ["国际品牌", "消费品展区", "技术装备展区"],
    host: "中国国际进口博览局",
    summary: "综合型头部展会，消费品、食品、技术装备等品牌集中，适合做高质量专题和商务线索承接。",
    highlights: ["国际品牌集中", "大型商业合作入口", "适合专题化运营"],
    fitProducts: ["品牌引入", "体验设计", "活动专题", "合作线索"],
    source: "https://www.ciie.org/",
    sourceLabel: "中国国际进口博览会",
    isNew: true,
    isHeadline: true
  },
  {
    id: "evt-002",
    title: "上海国际美妆供应链博览会",
    city: "上海",
    venue: "上海新国际博览中心",
    type: "展会",
    rank: "A",
    status: "筹备中",
    startDate: "2026-05-12",
    endDate: "2026-05-14",
    industries: ["美妆", "香氛", "洗护"],
    brands: ["国货美妆", "香氛品牌", "供应链企业"],
    host: "行业展会主办方",
    summary: "覆盖美妆、香氛、洗护与供应链，适合寻找线下体验、快闪试用和新品牌首店机会。",
    highlights: ["美妆香氛密集", "适合品牌首店观察", "内容深挖空间大"],
    fitProducts: ["快闪体验", "慢闪首店", "体验SOP"],
    source: "https://www.chinabeautyexpo.com/",
    sourceLabel: "中国美容博览会",
    isNew: true,
    isHeadline: true
  },
  {
    id: "evt-003",
    title: "杭州国际数字生活博览会",
    city: "杭州",
    venue: "杭州大会展中心",
    type: "展会",
    rank: "A",
    status: "筹备中",
    startDate: "2026-09-18",
    endDate: "2026-09-21",
    industries: ["3C数码", "游戏/App", "商场"],
    brands: ["智能硬件", "数字生活", "消费科技"],
    host: "数字经济相关机构",
    summary: "面向数字生活和消费科技场景，适合寻找智能硬件、新品体验和数字化零售合作线索。",
    highlights: ["杭州数字经济优势", "智能硬件集中", "适合体验店模型"],
    fitProducts: ["慢闪体验", "新品测试", "数智化选址"],
    source: "待核验",
    sourceLabel: "待补充",
    isNew: false,
    isHeadline: true
  },
  {
    id: "evt-004",
    title: "广州国际美博会",
    city: "广州",
    venue: "中国进出口商品交易会展馆",
    type: "展会",
    rank: "S",
    status: "筹备中",
    startDate: "2026-03-10",
    endDate: "2026-03-12",
    industries: ["美妆", "香氛", "洗护", "保健品"],
    brands: ["美妆品牌", "香氛品牌", "个护企业"],
    host: "美博会主办方",
    summary: "华南美妆个护头部展会，品牌密度和渠道资源强，适合做行业专题与招商线索。",
    highlights: ["美妆个护头部场", "品牌与渠道集中", "商业化空间高"],
    fitProducts: ["行业专题", "快闪体验", "品牌合作"],
    source: "待核验",
    sourceLabel: "待补充",
    isNew: true,
    isHeadline: true
  },
  {
    id: "evt-005",
    title: "深圳国际消费电子展",
    city: "深圳",
    venue: "深圳会展中心",
    type: "展会",
    rank: "S",
    status: "筹备中",
    startDate: "2026-04-09",
    endDate: "2026-04-11",
    industries: ["3C数码", "游戏/App", "家居家装"],
    brands: ["智能硬件", "影像设备", "智能家居"],
    host: "消费电子展会主办方",
    summary: "消费电子与智能硬件密集场，适合挖掘新品体验、旗舰店升级和线下首店机会。",
    highlights: ["深圳硬件供应链", "新品体验需求强", "适合头部曝光"],
    fitProducts: ["新品测试", "体验设计", "慢闪首店"],
    source: "待核验",
    sourceLabel: "待补充",
    isNew: false,
    isHeadline: true
  },
  {
    id: "evt-006",
    title: "北京国际潮流玩具展",
    city: "北京",
    venue: "北京展览馆",
    type: "展会",
    rank: "A",
    status: "即将开始",
    startDate: "2026-08-22",
    endDate: "2026-08-24",
    industries: ["潮玩", "IP类", "游戏/App"],
    brands: ["潮玩品牌", "游戏IP", "文创IP"],
    host: "潮玩展会主办方",
    summary: "潮玩和IP线下消费场景集中，适合寻找IP快闪、主题慢闪和商场联名合作。",
    highlights: ["IP密度高", "适合商场合作", "年轻客群清晰"],
    fitProducts: ["IP快闪", "场景策展", "主题慢闪"],
    source: "待核验",
    sourceLabel: "待补充",
    isNew: true,
    isHeadline: true
  },
  {
    id: "evt-007",
    title: "上海城市户外生活节",
    city: "上海",
    venue: "黄浦滨江",
    type: "体验活动",
    rank: "A",
    status: "进行中",
    startDate: "2026-06-20",
    endDate: "2026-07-05",
    industries: ["运动户外", "鞋服", "食品饮料"],
    brands: ["户外品牌", "运动鞋服", "咖啡饮品"],
    host: "城市活动运营方",
    summary: "户外生活方式场景活动，适合观察运动户外品牌的城市快闪、体验营销和社群转化。",
    highlights: ["户外生活方式", "城市公共空间", "适合快闪体验"],
    fitProducts: ["快闪新品", "慢闪测试", "社群活动"],
    source: "待核验",
    sourceLabel: "待补充",
    isNew: true,
    isHeadline: false
  },
  {
    id: "evt-008",
    title: "杭州新消费品牌快闪季",
    city: "杭州",
    venue: "湖滨商圈",
    type: "快闪",
    rank: "B",
    status: "进行中",
    startDate: "2026-06-15",
    endDate: "2026-07-15",
    industries: ["香氛", "美妆", "食品饮料", "鞋服"],
    brands: ["新消费品牌", "生活方式品牌"],
    host: "商圈运营方",
    summary: "多品牌快闪集合活动，适合测试新锐品牌线下转化和商圈客流匹配。",
    highlights: ["新消费密集", "湖滨商圈", "适合小样本验证"],
    fitProducts: ["快闪体验", "市场调研", "首店测试"],
    source: "待核验",
    sourceLabel: "待补充",
    isNew: true,
    isHeadline: false
  },
  {
    id: "evt-009",
    title: "广州餐饮连锁加盟展",
    city: "广州",
    venue: "保利世贸博览馆",
    type: "招商会",
    rank: "B",
    status: "筹备中",
    startDate: "2026-07-26",
    endDate: "2026-07-28",
    industries: ["茶饮连锁", "餐厅", "食品饮料"],
    brands: ["茶饮品牌", "连锁餐饮", "供应链企业"],
    host: "餐饮展会主办方",
    summary: "餐饮和茶饮连锁招商场，适合数智化选址、网规拓店和竞品监测切入。",
    highlights: ["连锁餐饮集中", "加盟拓店诉求强", "适合选址产品"],
    fitProducts: ["数智化选址", "网规拓店", "竞品监测"],
    source: "待核验",
    sourceLabel: "待补充",
    isNew: false,
    isHeadline: false
  },
  {
    id: "evt-010",
    title: "深圳智能家居体验周",
    city: "深圳",
    venue: "南山科技园",
    type: "体验活动",
    rank: "B",
    status: "即将开始",
    startDate: "2026-07-08",
    endDate: "2026-07-14",
    industries: ["3C数码", "家居家装"],
    brands: ["智能家居", "清洁电器", "影音设备"],
    host: "科技园区运营方",
    summary: "智能家居体验型活动，适合智能硬件品牌做线下体验、场景设计和首店模型验证。",
    highlights: ["体验驱动", "智能硬件聚集", "适合模型验证"],
    fitProducts: ["慢闪体验", "体验设计", "市场调研"],
    source: "待核验",
    sourceLabel: "待补充",
    isNew: true,
    isHeadline: false
  },
  {
    id: "evt-011",
    title: "北京购物中心商业更新论坛",
    city: "北京",
    venue: "朝阳区会议中心",
    type: "峰会",
    rank: "A",
    status: "筹备中",
    startDate: "2026-09-06",
    endDate: "2026-09-07",
    industries: ["商场", "IP类", "运动户外", "潮玩"],
    brands: ["购物中心", "商业地产", "品牌方"],
    host: "商业地产媒体",
    summary: "商业地产与购物中心更新议题集中，适合品牌引入、空间招商和快闪合作资源对接。",
    highlights: ["商场决策者集中", "空间更新议题", "合作入口清晰"],
    fitProducts: ["品牌引入", "空间招商", "IP快闪"],
    source: "待核验",
    sourceLabel: "待补充",
    isNew: false,
    isHeadline: true
  },
  {
    id: "evt-012",
    title: "上海香氛生活方式快闪",
    city: "上海",
    venue: "武康路街区",
    type: "快闪",
    rank: "B",
    status: "历史",
    startDate: "2026-04-12",
    endDate: "2026-04-28",
    industries: ["香氛", "美妆", "商场"],
    brands: ["沙龙香", "国货香氛", "生活方式品牌"],
    host: "街区商业运营方",
    summary: "香氛生活方式快闪，已结束但具备历史归档和案例参考价值。",
    highlights: ["历史案例", "街区场景", "适合复盘"],
    fitProducts: ["慢闪体验", "五感设计", "案例复盘"],
    source: "待核验",
    sourceLabel: "待补充",
    isNew: false,
    isHeadline: false
  },
  {
    id: "evt-013",
    title: "AWE中国家电及消费电子博览会",
    city: "上海",
    venue: "上海新国际博览中心 + 上海东方枢纽国际商务合作区",
    type: "展会",
    rank: "S",
    status: "历史",
    startDate: "2026-03-12",
    endDate: "2026-03-15",
    dateText: "2026年3月12-15日",
    industries: ["3C数码", "家居家装", "商场"],
    brands: ["家电品牌", "智能家居", "消费电子"],
    host: "中国家用电器协会",
    summary: "AWE2026以AI科技、智慧生活为主线，聚合家电、消费电子、智慧家庭与人车家场景，是上海最强的消费电子与智能家居观察窗口之一。",
    highlights: ["官方明确年份", "双区模式", "智慧生活场景丰富"],
    fitProducts: ["慢闪体验", "新品测试", "体验设计"],
    source: "https://www.awe.com.cn/",
    sourceLabel: "AWE官网",
    isNew: false,
    isHeadline: true
  },
  {
    id: "evt-014",
    title: "CBE杭州国际美容博览会",
    city: "杭州",
    venue: "杭州国际博览中心",
    type: "展会",
    rank: "A",
    status: "历史",
    startDate: "2026-09-10",
    endDate: "2026-09-11",
    dateText: "2026年9月10-11日",
    industries: ["美妆", "香氛", "洗护", "3C数码"],
    brands: ["美妆品牌", "新渠道", "直播电商"],
    host: "China Beauty Expo",
    summary: "CBE杭州聚焦美妆新渠道、供应链和达人/MCN资源，适合看新锐品牌如何把线上热度转成线下合作与采购机会。",
    highlights: ["官方明确日期", "杭州消费品牌密集", "新渠道资源集中"],
    fitProducts: ["品牌合作", "快闪体验", "市场调研"],
    source: "https://visit-hz.cbebaiwen.com/",
    sourceLabel: "CBE杭州官网",
    isNew: false,
    isHeadline: true
  },
  {
    id: "evt-015",
    title: "中国国际高新技术成果交易会",
    city: "深圳",
    venue: "深圳国际会展中心（宝安）",
    type: "展会",
    rank: "S",
    status: "筹备中",
    startDate: "",
    endDate: "",
    dateText: "2026年11月（官网待更新具体日期）",
    industries: ["3C数码", "游戏/App", "家居家装", "商场"],
    brands: ["人工智能", "机器人", "智慧城市", "消费电子"],
    host: "深圳市人民政府",
    summary: "高交会官网已发布 2026 年合作伙伴招募等公告，主站长期聚焦人工智能、机器人、低空经济、电子信息和新质生产力，是深圳全年最强的科技展会阵地之一。",
    highlights: ["官方已进入 2026 筹备", "科技类头部展会", "面向产业链全景"],
    fitProducts: ["新品测试", "数智化选址", "体验设计"],
    source: "https://www.chtf.com/",
    sourceLabel: "高交会官网",
    isNew: true,
    isHeadline: true
  },
  {
    id: "evt-016",
    title: "广州国际车展",
    city: "广州",
    venue: "中国进出口商品交易会展馆",
    type: "展会",
    rank: "A",
    status: "筹备中",
    startDate: "",
    endDate: "",
    dateText: "年度展会，官网待更新日期",
    industries: ["汽车", "商场", "3C数码", "家居家装"],
    brands: ["主机厂", "新能源车", "智能座舱"],
    host: "广州国际车展组委会",
    summary: "广州车展为华南地区最强汽车展会之一，承载主机厂发布、新能源车试乘试驾与城市级品牌曝光，适合作为广州的高价值样本。",
    highlights: ["华南车展头部", "品牌发布密集", "年度高关注度"],
    fitProducts: ["品牌引入", "体验设计", "活动专题"],
    source: "https://www.autoguangzhou.com.cn/",
    sourceLabel: "广州国际车展官网",
    isNew: true,
    isHeadline: false
  }
];

const supplementalActivities = [
  {
    id: "evt-017",
    title: "上海慕尼黑体育及户外用品展览会 ISPO SHANGHAI",
    city: "上海",
    venue: "上海新国际博览中心",
    type: "展会",
    rank: "S",
    status: "即将开始",
    startDate: "2026-07-03",
    endDate: "2026-07-05",
    industries: ["运动户外", "鞋服", "商场"],
    brands: ["户外品牌", "运动科技", "露营生活", "跑步装备"],
    host: "慕尼黑国际博览集团",
    summary: "ISPO SHANGHAI是亚太地区最具影响力的体育及户外用品展之一，围绕户外运动、露营生活、运动训练、城市运动、水上运动、供应链、冬季运动和跨境电商等品类展开，和 LHB 的慢闪体验、品牌首店、场景测试高度匹配。",
    highlights: ["亚太地区最具影响力的运动用品与时尚展之一", "展览面积3.3万㎡", "572家展商", "预计4.0万+专业观众"],
    fitProducts: ["慢闪体验", "新品测试", "体验设计", "品牌合作"],
    audience: ["运动行业从业者", "户外用品品牌方", "渠道采购", "运动科技服务商", "商场运动业态负责人", "运动爱好者"],
    attendeeRoles: ["品牌市场负责人", "渠道负责人", "采购负责人", "新品负责人", "产品研发代表", "设计师"],
    representativeBrands: ["CAMEL骆驼", "牧高笛", "Shokz韶音", "Black Diamond", "3M", "vibram", "UTO"],
    scale: "展览面积3.3万㎡，572家展商，预计40174名观众到场",
    ticketInfo: "门票折扣价60元；展商/电子会刊55元；门票为电子门票，国内观众线上预登记需实名制绑定身份证信息",
    participation: "建议参观+购买电子会刊；头部品牌可预约会前拜访；现场刷身份证或电子门票二维码入场",
    buSuggestion: ["快闪/慢闪BD", "体验设计", "品牌合作"],
    leadAngle: "用「运动户外品牌多城慢闪验证」切入，重点找新品体验、城市限定、商场联动需求。",
    mediaAccounts: ["ISPO SHANGHAI", "ISPO", "运动户外行业媒体"],
    sourceType: "聚展网",
    sourceConfidence: "高",
    source: "https://www.jufair.com/exhibition/3385.html",
    sourceLabel: "聚展网 ISPO上海展",
    image: "https://dcdn-jufair.jufair.com/jufair/tJNmPC6JSYQZWQYaCiPwQMAGAMm7KWPD.png?x-oss-process=image/resize,w_564,h_334/format,webp/quality,q_70",
    imageAlt: "ISPO上海展官方活动图",
    imageGallery: [
      "https://dcdn-jufair.jufair.com/jufair/BatY8z6KAiTsDWxRhecyncWkF7rKaEry.jpeg?x-oss-process=image/resize,w_260,h_560/format,webp/quality,q_70/watermark,image_bG9nby9qdXpoYW4ucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLFBfMTI,x_10,y_10",
      "https://dcdn-jufair.jufair.com/jufair/j62GNi3GSiZi3pPXNWW2HaZFB3dQSDbC.jpeg?x-oss-process=image/resize,w_260,h_560/format,webp/quality,q_70/watermark,image_bG9nby9qdXpoYW4ucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLFBfMTI,x_10,y_10"
    ],
    officialImageCredit: "聚展网官方页面",
    openHours: "09:00-18:00",
    frequency: "1年1届",
    rating: "4.4",
    viewCount: "4.2w浏览",
    venueAddress: "上海市浦东新区龙阳路2345号",
    showSlogan: "亚太地区最具影响力的运动用品与时尚展之一",
    exhibitScope: [
      "健身板块：功能训练、力量训练小器材、康复训练设备、运动电子产品、运动营养、瑜伽/普拉提等",
      "户外板块：抱石攀岩、登山、户外配件、露营、攀岩、探索旅行、徒步旅行",
      "跑步板块：跑步教育培训机构、跑步赛事服务、跑步装备、铁人三项、越野跑等",
      "水上运动板块：冲浪、独木舟、风筝冲浪、皮划艇、潜水、站立式桨板等",
      "供应商专区：ODM、代加工服务商、街头运动、软装备、纤维与保温材料、中间层等"
    ],
    exhibitorResearch: ["88%的展商在本届展会上有所收获", "85%的展商表示参加ISPO Shanghai 2020"],
    sourceFacts: [
      "聚展网记录：2026.07.03-07.05，开闭馆时间09:00-18:00，上海新国际博览中心。",
      "聚展网记录：举办周期1年1届，展览面积3.3万㎡，展商572家，观众约4.0万人。",
      "聚展网记录：展商/电子会刊55元，门票折扣价60元，展会评分4.4。",
      "聚展网介绍：ISPO SHANGHAI围绕户外运动、露营生活、运动训练、城市运动、水上运动、供应链、冬季运动及跨境电商等品类。"
    ],
    contentSections: [
      {
        title: "展会定位",
        body: "上海慕尼黑体育及户外用品展览会（ISPO SHANGHAI）是亚太地区最具影响力的体育及户外用品展之一，反映了亚太地区运动用品行业旺盛的季节性需求，也是慕尼黑国际博览集团面向该地区市场的重要运动商贸平台。"
      },
      {
        title: "品类与内容",
        body: "展会围绕户外运动、露营生活、运动训练、城市运动、水上运动、运动产业供应链、冬季运动及跨境电商等多个品类，为运动行业从业者和爱好者提供行业资讯、品牌创新成果、跨界交流和贸易洽谈平台。"
      },
      {
        title: "参展价值",
        body: "ISPO SHANGHAI具备运动、时尚、健康跨界融合的平台属性，覆盖户外装备、运动科技、时尚潮流、功能性面料、儿童运动等场景，适合LHB重点跟进新品体验、商场联动、城市限定快闪与运动生活方式品牌合作。"
      }
    ],
    updatedAt: "2026-06-27",
    isNew: true,
    isHeadline: true
  },
  {
    id: "evt-018",
    title: "中国国际动漫游戏博览会 CCG EXPO",
    city: "上海",
    venue: "上海跨国采购会展中心",
    type: "展会",
    rank: "S",
    status: "即将开始",
    startDate: "2026-07-04",
    endDate: "2026-07-06",
    industries: ["潮玩", "IP类", "游戏/App", "商场"],
    brands: ["动漫游戏厂商", "潮玩IP", "B站生态", "文创品牌"],
    host: "中华人民共和国文化和旅游部、上海市人民政府",
    summary: "动漫游戏与IP消费的头部线下场，适合捕捉潮玩IP快闪、商场联名、主题慢闪和年轻客群运营机会。",
    highlights: ["聚展网已核实", "25万+浏览热度", "IP快闪机会强"],
    fitProducts: ["IP快闪", "主题慢闪", "场景策展", "商场联名"],
    audience: ["IP版权方", "潮玩品牌", "游戏厂商", "商场活动负责人"],
    attendeeRoles: ["品牌授权负责人", "市场负责人", "渠道负责人", "活动策划负责人"],
    representativeBrands: ["腾讯视频", "BiliBili", "米游社", "IPSTAR潮玩星球"],
    scale: "约5.3万㎡，500家展商，约4.8万观众",
    ticketInfo: "聚展网显示门票折扣价约500元，展商/电子会刊约50元",
    participation: "建议参观+品牌授权线索收集；重点沉淀IP快闪案例库",
    buSuggestion: ["IP快闪BD", "商场合作", "内容专题"],
    leadAngle: "优先对接具备城市巡展、商场联名、限定快闪需求的IP与潮玩品牌。",
    mediaAccounts: ["CCG EXPO", "上海动漫游戏产业平台", "B站活动生态"],
    sourceType: "聚展网",
    sourceConfidence: "高",
    source: "https://www.jufair.com/exhibition/3392.html",
    sourceLabel: "聚展网 CCG EXPO",
    image: "https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?auto=format&fit=crop&w=900&q=80",
    imageAlt: "动漫游戏与IP活动场景",
    updatedAt: "2026-06-27",
    isNew: true,
    isHeadline: true
  },
  {
    id: "evt-019",
    title: "深圳时尚家居设计周暨深圳国际家具展",
    city: "深圳",
    venue: "深圳国际会展中心",
    type: "展会",
    rank: "S",
    status: "历史",
    startDate: "2026-03-17",
    endDate: "2026-03-20",
    industries: ["家居家装", "商场", "设计装饰"],
    brands: ["芝华仕", "源氏木语", "家居设计品牌", "策展服务商"],
    host: "深圳市家具行业协会",
    summary: "参考表显示该展具备超大规模家居品牌触达价值，适合挖掘家居品牌慢闪店、设计导向体验店、IP联名场景需求。",
    highlights: ["参考表重点推荐", "家居品牌密度高", "慢闪需求强"],
    fitProducts: ["慢闪体验", "体验设计", "品牌首店", "场地合作"],
    audience: ["家居品牌方", "设计机构", "策展公司", "渠道商"],
    attendeeRoles: ["董事长/创始人", "品牌总监", "渠道总经理", "设计负责人"],
    representativeBrands: ["芝华仕", "源氏木语", "HOOCI禾壹设计"],
    scale: "参考表：约32万㎡，800+展商，40万+观众",
    ticketInfo: "待官网复核",
    participation: "建议作为家居慢闪样板池；下届提前2个月抓参展品牌名单",
    buSuggestion: ["慢闪BD", "体验设计", "场地资源"],
    leadAngle: "以「家居品牌线下体验升级+可计算慢闪」切入，优先找新系列、新店型和IP联名项目。",
    mediaAccounts: ["深圳时尚家居设计周", "家居行业媒体", "设计类公众号"],
    sourceType: "本地参考表",
    sourceConfidence: "中",
    source: "2025～2026线下行业峰会、展会表.xlsx",
    sourceLabel: "本地参考表：展会活动清单",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
    imageAlt: "家居展与生活方式空间",
    updatedAt: "2026-06-27",
    isNew: true,
    isHeadline: true
  },
  {
    id: "evt-020",
    title: "CIFF中国国际家具博览会（广州）",
    city: "广州",
    venue: "广州琶洲广交会展馆",
    type: "展会",
    rank: "S",
    status: "历史",
    startDate: "2026-03-18",
    endDate: "2026-03-21",
    industries: ["家居家装", "商场", "设计装饰"],
    brands: ["家具品牌", "定制家居", "红星美凯龙", "渠道商"],
    host: "中国家具协会、中国对外贸易中心、红星美凯龙家居集团",
    summary: "家具与定制家居品牌高度集中的头部展，适合面向品牌方、渠道商和商业空间运营方做慢闪、体验设计与场地合作线索。",
    highlights: ["家居头部展", "品牌和渠道集中", "适合BD集中拜访"],
    fitProducts: ["慢闪体验", "单店模型", "体验设计", "渠道合作"],
    audience: ["家居品牌方", "定制家居企业", "渠道商", "商业地产"],
    attendeeRoles: ["董事长/CEO", "渠道负责人", "设计负责人", "营销负责人"],
    representativeBrands: ["红星美凯龙", "定制家居品牌", "家具制造品牌"],
    scale: "参考表：春秋两届约6000家品牌，超50万专业观众；广州展约75万㎡",
    ticketInfo: "参考表：需门票，线上预约登记",
    participation: "建议参观+品牌名单筛选；适合会前约访家居新零售品牌",
    buSuggestion: ["家居BD", "慢闪/体验设计", "品牌合作"],
    leadAngle: "面向家具、定制、家居新零售客户，强调低成本试错和可计算ROI。",
    mediaAccounts: ["中国家博会CIFF", "中国建博会", "泛家居圈"],
    sourceType: "本地参考表",
    sourceConfidence: "中",
    source: "2025～2026线下行业峰会、展会表.xlsx",
    sourceLabel: "本地参考表：展会活动清单",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80",
    imageAlt: "家具与家居展陈空间",
    updatedAt: "2026-06-27",
    isNew: true,
    isHeadline: true
  },
  {
    id: "evt-021",
    title: "第五届 FAW 灵感香氛国际艺术周",
    city: "广州",
    venue: "广州琶洲·灵感创新展馆",
    type: "展会",
    rank: "A",
    status: "历史",
    startDate: "2026-03-06",
    endDate: "2026-03-08",
    industries: ["香氛", "美妆", "生活方式"],
    brands: ["香氛品牌", "沙龙香", "香薰香水供应链"],
    host: "灵感香氛艺术周组委会",
    summary: "香氛垂直主题活动，和LHB的五感体验、慢闪首店、香氛生活方式场景高度贴合。",
    highlights: ["香氛A类行业", "200+香氛品牌", "五感体验适配"],
    fitProducts: ["慢闪体验", "五感设计", "品牌首店", "场景快闪"],
    audience: ["香氛品牌", "美妆个护品牌", "生活方式集合店", "渠道商"],
    attendeeRoles: ["品牌创始人", "市场负责人", "渠道负责人", "产品负责人"],
    representativeBrands: ["香氛品牌", "艺术香氛", "香薰供应链"],
    scale: "参考表：200+香氛品牌，10000+行业从业者",
    ticketInfo: "待官网复核",
    participation: "建议作为香氛行业重点案例池；补抓公众号文章和参展品牌名单",
    buSuggestion: ["香氛BD", "体验设计", "内容专题"],
    leadAngle: "用「香需要线下五感体验建立溢价」切入，主推慢闪和首店体验。",
    mediaAccounts: ["灵感香氛艺术周", "香水时代", "美妆行业观察"],
    sourceType: "本地参考表",
    sourceConfidence: "中",
    source: "2025～2026线下行业峰会、展会表.xlsx",
    sourceLabel: "本地参考表：香氛香水",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80",
    imageAlt: "香氛与生活方式产品",
    updatedAt: "2026-06-27",
    isNew: true,
    isHeadline: true
  },
  {
    id: "evt-022",
    title: "中国国际服装服饰博览会 CHIC（上海）",
    city: "上海",
    venue: "国家会展中心（上海）北馆",
    type: "展会",
    rank: "A",
    status: "历史",
    startDate: "2025-09-02",
    endDate: "2025-09-04",
    industries: ["鞋服", "运动户外", "商场"],
    brands: ["安踏", "UR", "服装品牌", "渠道商"],
    host: "中国服装协会、中国国际贸易中心、中国贸促会纺织行业分会",
    summary: "服装服饰品牌与渠道资源集中，适合作为鞋服、运动休闲、设计师品牌慢闪和首店测试的线索来源。",
    highlights: ["服饰品牌密集", "渠道资源强", "适合首店测试"],
    fitProducts: ["慢闪首店", "市场调研", "体验设计", "渠道合作"],
    audience: ["服装品牌", "运动品牌", "渠道商", "零售服务商"],
    attendeeRoles: ["品牌CEO/COO", "区域代理商", "渠道负责人", "市场负责人"],
    representativeBrands: ["安踏", "UR", "阿里云", "吉祥衣家"],
    scale: "参考表：约60000+观众，600+展商",
    ticketInfo: "待官网复核",
    participation: "历史归档；用于复盘鞋服品牌目标清单和下届抓取模板",
    buSuggestion: ["鞋服BD", "慢闪首店", "调研定位"],
    leadAngle: "围绕新锐服饰、运动休闲和国际品牌入华，主推低成本多城测试。",
    mediaAccounts: ["CHIC服博会", "中服网", "时尚商业媒体"],
    sourceType: "本地参考表",
    sourceConfidence: "中",
    source: "2025～2026线下行业峰会、展会表.xlsx",
    sourceLabel: "本地参考表：泛零售行业",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    imageAlt: "服装服饰零售场景",
    updatedAt: "2026-06-27",
    isNew: false,
    isHeadline: false
  },
  {
    id: "evt-023",
    title: "2025中国杭州零售供应链展览会",
    city: "杭州",
    venue: "杭州国际博览中心G20展馆",
    type: "展会",
    rank: "B",
    status: "历史",
    startDate: "2025-10-29",
    endDate: "2025-10-31",
    industries: ["商场", "食品饮料", "便利店", "茶饮连锁"],
    brands: ["沃尔玛", "盒马", "叮咚买菜", "京东物流"],
    host: "灵兽传媒、SPE超采会",
    summary: "零售供应链与连锁商超资源集中，适合LHB切入连锁品牌拓店、供应链品牌线下展示和零售选址数据服务。",
    highlights: ["杭州零售资源", "商超/供应链客户", "适合数据服务"],
    fitProducts: ["数智化选址", "品牌引入", "竞品监测", "市场调研"],
    audience: ["连锁商超", "供应链企业", "零售科技服务商", "品牌商"],
    attendeeRoles: ["董事长/总经理", "供应链总监", "采购负责人", "物流规划经理"],
    representativeBrands: ["沃尔玛", "盒马", "叮咚买菜", "京东物流", "中粮福临门"],
    scale: "参考表：约400+参会，200+展商",
    ticketInfo: "待官网复核",
    participation: "历史归档；建议沉淀杭州零售/供应链BD名单",
    buSuggestion: ["数智化选址", "零售BD", "数据服务"],
    leadAngle: "从区域零售和供应链企业的门店网络规划、选址和竞品监测切入。",
    mediaAccounts: ["灵兽传媒", "SPE超采会", "零售商业财经"],
    sourceType: "本地参考表",
    sourceConfidence: "中",
    source: "2025～2026线下行业峰会、展会表.xlsx",
    sourceLabel: "本地参考表：泛零售行业",
    image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=900&q=80",
    imageAlt: "商超与零售空间",
    updatedAt: "2026-06-27",
    isNew: false,
    isHeadline: false
  },
  {
    id: "evt-024",
    title: "2025智能家居UP峰会",
    city: "杭州",
    venue: "杭州",
    type: "峰会",
    rank: "B",
    status: "历史",
    startDate: "2025-03-01",
    endDate: "2025-03-31",
    dateText: "2025年3月",
    industries: ["3C数码", "家居家装", "智能家居"],
    brands: ["阿里", "小米", "三星", "涂鸦智能"],
    host: "中国智能家居产业联盟、浙江省智能家居协会",
    summary: "智能家居品牌、平台和协会资源集中，适合寻找智能硬件线下体验、场景样板间和新店型验证机会。",
    highlights: ["智能家居资源", "杭州数字生态", "适合体验店模型"],
    fitProducts: ["慢闪体验", "体验设计", "新品测试", "市场调研"],
    audience: ["智能家居品牌", "IoT平台", "家居渠道", "投资方"],
    attendeeRoles: ["生态业务负责人", "研发负责人", "品牌负责人", "董事长"],
    representativeBrands: ["阿里", "小米", "三星", "涂鸦智能"],
    scale: "参考表待补充",
    ticketInfo: "待官网复核",
    participation: "历史归档；建议补充公众号文章和下届活动排期",
    buSuggestion: ["3C/智能家居BD", "体验设计", "新品测试"],
    leadAngle: "以智能家居线下体验和样板间快闪切入，匹配商场与社区空间。",
    mediaAccounts: ["浙江省智能家居协会", "中国智能家居产业联盟", "智哪儿"],
    sourceType: "本地参考表",
    sourceConfidence: "中",
    source: "2025～2026线下行业峰会、展会表.xlsx",
    sourceLabel: "本地参考表：家居家电",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80",
    imageAlt: "智能家居设备场景",
    updatedAt: "2026-06-27",
    isNew: false,
    isHeadline: false
  },
  {
    id: "evt-025",
    title: "CHF2025大家居产业趋势峰会",
    city: "北京",
    venue: "北京·CHF家具展同期论坛区",
    type: "峰会",
    rank: "B",
    status: "历史",
    startDate: "2025-03-01",
    endDate: "2025-03-31",
    dateText: "2025年3月",
    industries: ["家居家装", "商场", "设计装饰"],
    brands: ["居然之家", "尚品宅配", "东方雨虹", "家居服务商"],
    host: "中展智奥、国富纵横、大家居教育平台",
    summary: "北京家居产业趋势峰会样本，适合观察家居头部品牌、卖场与服务商的慢闪、IP联名快闪和场景体验升级需求。",
    highlights: ["北京重点城市", "家居品牌决策层", "参考表明确优势"],
    fitProducts: ["慢闪体验", "IP联名快闪", "体验设计", "市场调研"],
    audience: ["家居品牌方", "家居卖场", "行业教育服务商", "设计机构"],
    attendeeRoles: ["董事长", "CEO", "创始人", "销售总监", "渠道总经理"],
    representativeBrands: ["居然之家", "尚品宅配", "东方雨虹"],
    scale: "参考表：CHF家具展同期论坛区，总展参展品牌3000+，人流13万",
    ticketInfo: "待官网复核",
    participation: "历史归档；建议作为北京家居品牌和卖场线索池",
    buSuggestion: ["家居BD", "慢闪体验", "IP快闪"],
    leadAngle: "以家居品牌新品推广、卖场体验升级、IP联名快闪为切入点。",
    mediaAccounts: ["大家居教育平台", "搜狐家居", "新浪家居"],
    sourceType: "本地参考表",
    sourceConfidence: "中",
    source: "2025～2026线下行业峰会、展会表.xlsx",
    sourceLabel: "本地参考表：家居家电",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80",
    imageAlt: "家居峰会与空间体验",
    updatedAt: "2026-06-27",
    isNew: false,
    isHeadline: false
  }
];

activities.push(...supplementalActivities);
activities.push(...(window.JUFAIR_ACTIVITIES || []));
activities.push(...(window.HUODONGXING_ACTIVITIES || []));
activities.push(...(window.MEDIA_ACTIVITIES || []));
activities.push(...(window.FRESH_ACTIVITIES || []));
activities.forEach(applyActivityDefaults);

const activityEnrichments = window.ACTIVITY_ENRICHMENTS || {};
activities.forEach((activity) => {
  const enrichment = activityEnrichments[activity.id];
  if (!enrichment) return;
  Object.entries(enrichment).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length) activity[key] = value;
      return;
    }
    if (value !== undefined && value !== null && value !== "") {
      activity[key] = value;
    }
  });
});

activities.forEach((activity) => {
  const isStockImage = (url) => typeof url === "string" && url.includes("images.unsplash.com");
  if (isStockImage(activity.image)) {
    delete activity.image;
    delete activity.imageAlt;
    delete activity.officialImageCredit;
  }
  if (Array.isArray(activity.imageGallery)) {
    activity.imageGallery = activity.imageGallery.filter((url) => !isStockImage(url));
    if (!activity.imageGallery.length) delete activity.imageGallery;
  }
  if (Array.isArray(activity.contentSections)) {
    activity.contentSections = activity.contentSections.filter((section) => {
      const body = section?.body || "";
      return body && !body.startsWith("!function(") && !body.includes("module.exports=e()");
    });
  }
});
