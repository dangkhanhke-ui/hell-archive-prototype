(function (root) {
  "use strict";
  const DATA = root.ATWG_DATA;
  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/đ/g, "d").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
  }
  function search(scope, query) {
    const terms = normalize(query).split(" ").filter(Boolean);
    return DATA.records.filter(record => {
      if (record.scope !== scope) return false;
      if (!terms.length) return true;
      const index = normalize([record.id, record.title, record.date, record.origin, ...record.terms].join(" "));
      return terms.every(term => index.split(" ").some(word => word.startsWith(term)));
    });
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
  root.ATWG_RULES = {normalize, search, photoFor, evaluate};
})(window);
