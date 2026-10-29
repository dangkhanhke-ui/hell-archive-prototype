(function (root) {
  "use strict";
  const DATA = root.ATWG_DATA;
  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  }
  // Four documented forms: A, A_YEAR, A_B, A_B_YEAR.
  // A/B are filing headings, NOT natural-language questions.
  function parseQuery(input) {
    const raw=String(input || "").trim();
    if(!raw) return {ok:false,error:"Nhập tên người, sự việc, ấn phẩm hoặc mã hồ sơ."};
    const parts=raw.split("_").map(p=>p.trim());
    if(parts.length>3 || parts.some(p=>!p))return {ok:false,error:"Cú pháp: A, A_NĂM, A_B hoặc A_B_NĂM. Dùng dấu _ để phân cách."};
    let year=null;
    if(/^\d{4}$/.test(parts[parts.length-1])) year=parts.pop();
    if(parts.length<1 || parts.length>2 || parts.some(p=>/^\d{4}$/.test(p)))return {ok:false,error:"Tên đề mục đứng trước; năm bốn chữ số chỉ được đặt cuối."};
    if(/^(ai|tai sao|vì sao|tim|tìm|cho tôi|bao chi ve|báo chí về|nhung gi|những gì)\b/i.test(raw))return {ok:false,error:"Máy chỉ tra đề mục, không nhận câu hỏi. Ví dụ: Serrano_1962."};
    return {ok:true,headings:parts,year};
  }
  function allHeadings(){
    return Object.values(DATA.catalog || {}).flat();
  }
  function resolveHeading(raw) {
    const q=normalize(raw);
    const known=allHeadings().find(item=>[item.label,item.query,...(item.aliases||[])].some(v=>normalize(v)===q));
    return normalize(known?known.query:raw);
  }
  function indexedFields(record) {
    // Only title, record code, printed metadata and explicit filing terms.
    return [record.id,record.title,record.origin,...record.terms].map(normalize);
  }
  function matchesHeading(record,raw) {
    const needle=resolveHeading(raw);
    if(!needle)return false;
    return indexedFields(record).some(value=>value===needle || value.startsWith(needle+" ") ||
      value.includes(" "+needle+" ") || value.endsWith(" "+needle));
  }
  function queryArchive(input,scope="all") {
    const parsed=parseQuery(input);
    if(!parsed.ok)return {...parsed,records:[]};
    const records=DATA.records.filter(record=>
      (scope==="all"||record.scope===scope) &&
      (!parsed.year || (record.date||"").match(/\b\d{4}\b/)?.[0]===parsed.year) &&
      parsed.headings.every(heading=>matchesHeading(record,heading))
    );
    return {...parsed,records};
  }
  // Backward compatible wrapper for the Case 01 rules tests.
  function search(scope,query) {
    if(!String(query||"").trim())return DATA.records.filter(r=>scope==="all"||r.scope===scope);
    return queryArchive(query,scope).records;
  }
  function photoFor(code, readIds) {
    const photo = DATA.photos.find(item => normalize(item.id) === normalize(code));
    return photo && readIds.includes(photo.source) ? photo : null;
  }
  const expected = {
    "09": [
      {required:["C03"],optional:[]},
      {required:["C01"],optional:[]},
      {required:["S02","WP-12B","WP-12TX"],optional:["S01"]},
      {required:["S03","S04"],optional:[]}
    ],
    "05": [
      {required:["T08"],optional:["C02"]},
      {required:["T05","T09"],optional:["T06"]},
      {required:["T04","T07"],optional:["T03","T06"]},
      {required:["T01","T02"],optional:[]}
    ]
  };
  function evaluate(suspect, room, papers) {
    if (!DATA.suspects[suspect]) return "invalid";
    if (DATA.suspects[suspect].room !== room) return "jurisdiction";
    const layers = expected[suspect];
    const submitted = papers.filter(p => p.location && p.location.suspect === suspect);
    const allRequired = layers.every((layer, i) => layer.required.every(id => submitted.some(p => p.id === id && p.location.layer === i)));
    const allPlacedLogically = submitted.every(p => {
      const layer = layers[p.location.layer];
      return layer && [...layer.required,...layer.optional].includes(p.id);
    });
    return allRequired && allPlacedLogically ? "admitted" : "incomplete";
  }
  root.ATWG_RULES = {normalize, parseQuery, queryArchive, search, photoFor, evaluate};
})(window);
