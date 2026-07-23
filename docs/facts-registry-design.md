# Facts Registry — แบบร่าง interface

> สถานะ: **ออกแบบแล้ว ยังไม่ implement** · สังเคราะห์จาก 4 design ที่ทำแยกกันตาม "Design It Twice"
> (A Philosophy of Software Design) · ก.ค. 2026

---

## 1) ปัญหา (นับจากของจริง ไม่ใช่ความรู้สึก)

ตัวเลขเชิงข้อเท็จจริงเกี่ยวกับ Starlink ถูก hardcode เป็น string literal กระจายทั่ว `index.html`
นับจำนวนจุดที่มี fact ปรากฏได้ประมาณนี้:

| Context | จำนวน | สัดส่วน |
|---|---|---|
| KV row ใน template literal (`class="v"`) | ~33 | 31% |
| ร้อยแก้วใน template literal (`<b class="c">` + ตัวเลขเปล่าใน `.note`) | ~35 | 33% |
| Markup นิ่งใน body (chip, shell-row, networkKey) | ~29 | 27% |
| Plain text (`makeLabel`, สตริงสถานะใน JS) | ~9 | 8% |

รวม **~106 จุด — 92% ลงที่ HTML, 8% เป็น plain text**

ค่าที่ซ้ำมากที่สุด (หลัง realism pass 2026-07) คือ **`10,759` working (McDowell 11 Jul 2026)** — ต้องผ่าน `REAL.satsOnOrbit` เท่านั้น
รองลงมา `20–60 ms` และ `340–570 กม.` (ช่วง LEO รวม Gen1+Gen2)

ต้นทุนจริงที่เจอตอนแก้รอบ ก.ค. 2026: `200 Gbps` อยู่ทั้งใน `makeLabel()` และใน template literal
ต้องแก้สองที่ ถ้าลืมที่ใดที่หนึ่งจะไม่มีอะไรเตือน และ source of truth จริงอยู่ใน
`docs/starlink-specs-2026.md` ซึ่ง sync ด้วยมือล้วน

## 2) ข้อค้นพบที่เปลี่ยนรูปของ solution

**ความสูงวงโคจรที่ "ไม่ตรงกัน" ไม่ใช่บั๊ก sync — มันคือคนละ fact ที่ใส่ป้ายเดียวกัน**

- `~340–570 กม.` = ช่วงจริงตามใบอนุญาต FCC (Gen1 540–570 + Gen2 ต่ำสุด 340)
- `358.5–485 กม.` = shell ที่ **ฉากนี้จำลอง** เท่านั้น

การ sync ด้วยมือถึงผลิตค่าที่สามออกมาเรื่อย ๆ **ถ้ายุบเป็น id เดียวคือ encode บั๊กลงไปถาวร**
ต้องเป็นสอง id แยกกัน + ฟิลด์ `models:` ประกาศว่าต่างกันโดยตั้งใจ + audit เตือนเมื่อค่าที่จำลอง
หลุดออกนอกช่วงจริง

## 3) มี registry อยู่แล้วในรูปตัวอ่อน

`REAL` ใน `index.html` เก็บ `satsOnOrbit: 10759` (McDowell working), `markets: 166`, `customersM: 10.3`
และมีฟิลด์ `asOf` — **ไม่ต้องสร้าง global ที่สาม ให้ `REAL` กลายเป็น derived จาก `FACTS`**

`REAL.*` ถูกอ่านแค่ 10 จุดใน 5 properties → ความเสี่ยงในการเปลี่ยนต่ำมาก

---

## 4) Interface

ชื่อ `F` — ตรวจแล้วว่าว่างสนิทใน `index.html` (0 occurrences) grep ได้ด้วย `\bF[(.]`
และตัวพิมพ์ใหญ่ละตินเด่นชัดในร้อยแก้วไทย ช่วยให้อ่าน call site ออก

```js
F(id, opts?)          -> string      // HTML — เคสหลัก 92%
F.txt(id, opts?)      -> string      // plain text ล้วน ไม่มีทางมี markup — sprite / canvas / aria
F.row(id, opts?)      -> string      // <div><span class="k">…</span><span class="v">…</span></div> ครบ
F.note(...ids)        -> string      // ประโยคอ้างอิงแหล่งที่มา จัดกลุ่มตาม source
F.hydrate(root?)      -> number      // เติม [data-fact] ใน markup นิ่ง คืนจำนวนที่เติม
F.audit()             -> Problem[]   // ตรวจ ปลอดภัยที่จะเรียกใน production
```

หกตัว ไม่มี `F.value()` โดยตั้งใจ — โค้ดที่ต้องการตัวเลขไปคำนวณอ่าน `FACTS['id'].v` ตรง ๆ
เพราะการเอา display กับ computation มายัดผ่าน accessor เดียวคือจุดเริ่มของการ parse `"~340–570"`
กลับเป็น float

```js
opts = {
  lang:  'th' | 'en',                  // ค่าเริ่มต้น 'th'
  style: 'long' | 'short' | 'bare',    // long=มีหน่วย · short=ใช้ฟิลด์ short · bare=ตัวเลขเปล่า
  label: string                        // override ป้ายของ F.row เท่านั้น
}
```

### กฎที่ต่อรองไม่ได้ 3 ข้อ

**1. Conflict ต้องถูกเปิดเผยเสมอ** — ถ้า record มี `alt`:
`F()` และ `F.row()` เติมค่าที่ขัดแย้งให้อัตโนมัติ (`~100 Gbps (การตลาด: สูงสุด 200 Gbps)`)
`F.txt()` เติม `†` แทนเพราะ sprite ไม่มีที่ แล้ว audit จะ **error** ถ้าไม่มี call site ฝั่ง HTML ไหน
เปิดเผยเลย → ตัวเลข 200 Gbps โผล่เพราะ **record มี `alt`** ไม่ใช่เพราะคนจำได้

**2. `F()` ไม่ throw เด็ดขาด** — `STEPS` เป็น top-level `const` ที่ evaluate ตอน parse
ถ้า throw ตรงนั้นหน้าเว็บขาวทั้งหน้า id ที่ไม่รู้จักจะคืน marker ที่มองเห็น
`<b class="r" data-fact-error>⚠ isl.rat?</b>` แล้วบันทึกเป็น Problem — เห็นความผิดพลาดบนจอ
ตั้งแต่ reload ถัดไป ซึ่งเป็น test loop เดียวที่โปรเจกต์นี้มี

**3. ค่าใน record ห้ามมี markup** — validate ตอนโหลดว่าไม่มี `<` `>` `&`
เช็คบรรทัดเดียวนี้คือสิ่งที่ทำให้ output ของ `F.txt` ปลอดภัยทั้งใน HTML และใน `ctx.fillText()`
เลยไม่ต้องมี escaping API และไม่มีช่องรูปร่าง XSS

### Record shape

```js
FACTS['isl.rate.perLink'] = {
  v: 100,                      // number | [lo,hi] | string  (ค่าเดียวเท่านั้น 3 รูป)
  unit: 'Gbps',                // key เข้า UNITS · '' สำหรับ free text
  approx: true,                // เรนเดอร์ '~' นำหน้า

  th: 'อัตราต่อลิงก์',           // ป้ายไทย  → .k, F.note
  en: 'Per-link rate',         // ป้ายอังกฤษ → chip นิ่ง, sim panel
  tone: 'g',                   // '' | 'c' | 'r' | 'a' | 'g' — CSS class ที่มีอยู่แล้ว
  short: '~100 Gbps ต่อลิงก์',   // ทางเลือกสำหรับ sprite — module เป็นเจ้าของการย่อ ไม่ใช่ call site

  src: 'spie2024',             // → SOURCES (ใช้ร่วมกัน F.note จึงจัดกลุ่ม citation ได้)
  as: '2024-01-30',            // ISO
  tag: 'official',             // official | reverse | measured | estimated | unknown
  ttl: 540,                    // วันจนถือว่า stale · default ตาม tag

  scope: 'ต่อ transceiver',      // บังคับเมื่อมี fact พี่น้องหน่วยเดียวกันค่าต่างกัน
  models: null,                // id ของ fact จริงที่ค่านี้จำลอง (ดู §2)

  alt: {                       // มีได้ ไม่มีก็ได้ — แต่ถ้ามี ห้ามไม่เรนเดอร์
    v: 200, unit: 'Gbps', src: 'starlink-marketing', tag: 'unknown', as: '2026-07',
    why: 'เพดานต่อลิงก์ฝั่งการตลาด ไม่ใช่ต่อ transceiver'
  }
};

SOURCES['spie2024'] = {
  th: 'SPIE Photonics West, ม.ค. 2024',
  en: 'SPIE Photonics West, Jan 2024',
  who: 'Travis Brashears · วิศวกร SpaceX',
  doc: '#23-optical-inter-satellite-laser-links-isl'   // anchor ใน starlink-specs-2026.md
};

Problem = { id, kind, detail, severity:'error'|'warn' }
// kind: missing-source | stale | undisclosed-conflict | unknown-id | ambiguous-scope
//     | unmanaged-literal | no-callsite | model-drift | markup-in-value | too-long
```

### คู่ที่แก้บั๊กความสูงโดยโครงสร้าง

```js
FACTS['orbit.altitude.real'] = {
  v: [340, 570], unit: 'km', approx: true, tag: 'official', as: '2026-01',
  th: 'ระดับวงโคจร', en: 'Orbital altitude',
  scope: 'ทุก shell ตามใบอนุญาต', src: 'fcc-gen1-gen2'
};
FACTS['orbit.altitude.modeled'] = {
  v: [358.5, 485], unit: 'km', tag: 'estimated', as: '2026-07',
  th: 'ระดับวงโคจรในโมเดล', en: 'Altitude · modeled shells',
  scope: 'shell ที่ฉากนี้จำลอง',
  models: 'orbit.altitude.real'          // ← ประกาศว่าต่างโดยตั้งใจ
};
```

ไม่มี `F('orbit.altitude')` ให้เรียก จึงพิมพ์ผิดเป็นค่าที่สามไม่ได้

---

## 5) ใช้งานครบ 4 context

### 1. ร้อยแก้วกลางประโยค — `index.html:3446`

```js
// เดิม
body:`<p>GEO สูง <b class="r">35,786 กม.</b> → ping โดยทั่วไป <b class="r">600–700 ms</b> ·
Starlink อยู่ใน LEO ราว <b class="c">~340–570 กม.</b> จึงมี latency บนบกโดยทั่วไป
<b class="c">20–60 ms</b>; ...</p>`

// ใหม่
body:`<p>GEO สูง ${F('geo.altitude')} → ping โดยทั่วไป ${F('geo.latency')} ·
Starlink อยู่ใน LEO ราว ${F('orbit.altitude.real')} จึงมี latency บนบกโดยทั่วไป
${F('net.latency.land')}; ...</p>`
```

สี `r` กับ `c` หายไปจาก call site เพราะมันเป็นคุณสมบัติของ *fact* ไม่ใช่ของประโยค —
GEO เป็นสีแดงทุกที่เสมอ กำหนดที่เดียว ซึ่งเป็นวิธีเดียวที่กฎ "ห้ามใช้สีอย่างเดียวสื่อสถานะ"
ใน `design-system/MASTER.md` จะบังคับใช้ได้จริง

### 2. KV row — `index.html:3492`

```js
// เดิม
<div><span class="k">อัตราต่อลิงก์ · SPIE 2024</span><span class="v">~100 Gbps</span></div>
<div><span class="k">ระยะลิงก์สูงสุด</span><span class="v">5,400 กม.</span></div>

// ใหม่
${F.row('isl.rate.perLink')}
${F.row('isl.range.max')}
```

`F.row` ประกอบ `.k` เป็น `th · ชื่อย่อ source · วันที่แบบไทย` ซึ่งเป็นคอนเวนชันที่ไฟล์นี้
พิมพ์มือไว้อยู่แล้ว (`Working satellites · McDowell · 11 ก.ค. 2026`) — ควร generate จาก `REAL` เพื่อไม่ให้ drift

`isl.rate.perLink` มี `alt` → row เรนเดอร์ `~100 Gbps (การตลาด: สูงสุด 200 Gbps)` อัตโนมัติ

### 3. Sprite 3D — `index.html:3219`, `3221`

```js
// เดิม
makeLabel('laser','เลเซอร์ ISL · ~100 Gbps ต่อลิงก์','#39ff8a',6.5,null);
makeLabel('leo','Starlink LEO · ~340–570 กม. · บนบก 20–60 ms','#00aeef',62,latLon(30,99,ORB+30));

// ใหม่
makeLabel('laser',`เลเซอร์ ISL · ${F.txt('isl.rate.perLink',{style:'short'})}`,'#39ff8a',6.5,null);
makeLabel('leo',`Starlink LEO · ${F.txt('orbit.altitude.real',{style:'short'})} · บนบก ${F.txt('net.latency.land')}`,
          '#00aeef',62,latLon(30,99,ORB+30));
```

`F.txt` การันตีไม่มี markup → `ctx.measureText()` ใน `makeLabel` วัดสิ่งที่วาดจริง
และ `style:'short'` ให้ fact ยาวได้ในแผงแต่สั้นบน sprite โดยไม่ต้องมี source of truth ที่สอง

### 4. Markup นิ่ง — `index.html:857`

```html
<!-- เดิม -->
<div class="chip"><span class="k">Altitude · modeled shells</span><span class="v c">358.5–485 km</span></div>

<!-- ใหม่ -->
<div class="chip" data-fact="orbit.altitude.modeled" data-fact-as="row" data-fact-lang="en"></div>
```

`data-fact-lang="en"` ไม่ใช่ของเผื่ออนาคต — **chip เป็นอังกฤษอยู่แล้วขณะที่แผงเป็นไทย
สำหรับ fact ตัวเดียวกัน** จึงจำเป็นตั้งแต่วันแรก

เรียก `F.hydrate()` ครั้งเดียวตอน boot

### โบนัส — note ที่เป็นต้นเหตุบั๊ก `200 Gbps` (`index.html:3489`)

```js
// เดิม: 3 ค่า + 1 การอ้างอิง + 1 ค่าที่ขัดแย้ง พิมพ์มือทั้งหมด
<p class="note">เส้นเขียวในฉากเป็นเส้นทางจำลอง ไม่ใช่ routing สด · ตัวเลข 100 Gbps ต่อ transceiver,
ระยะสูงสุด 5,400 กม. และ 42 PB/วัน มาจาก Travis Brashears วิศวกร SpaceX บนเวที SPIE Photonics West
(ม.ค. 2024) ส่วนเพดาน 200 Gbps ต่อลิงก์เป็นตัวเลขฝั่งการตลาดของ Starlink; ...</p>

// ใหม่: คนเขียนแค่ประโยคเชิงบรรณาธิการ ประโยคอ้างอิงถูก generate
<p class="note">เส้นเขียวในฉากเป็นเส้นทางจำลอง ไม่ใช่ routing สด ·
ทั้งหมดเป็นความจุลิงก์ ไม่ใช่ความเร็วอินเทอร์เน็ตของผู้ใช้</p>
${F.note('isl.rate.perLink','isl.range.max','isl.throughput')}
```

`F.note` ยุบสาม fact ที่อ้าง `spie2024` เหมือนกันให้เหลือ citation เดียว แล้วต่อท้ายด้วย
การเปิดเผย `alt` ของ `isl.rate.perLink`

**ข้อจำกัดที่ต้องพูดตรง ๆ:** `F.note` generate เฉพาะ *ประโยคอ้างอิง* ไม่ generate ร้อยแก้ว
เชิงบรรณาธิการรอบ ๆ ภาษาไทยที่ประกอบด้วยเครื่องจะอ่านไม่ได้เรื่อง ดังนั้น note จะกลายเป็นสองท่อน
และคนเขียนต้องไม่พิมพ์ตัวเลขซ้ำลงในท่อนบรรณาธิการเอง — `F.audit()` จับไม่ได้ มีแต่การรีวิว

### `REAL` กลายเป็น derived

```js
// เดิม (index.html:1400) — source of truth ที่สอง
const REAL = { satsOnOrbit: 10759, customersM: 10.3, markets: 166,
               asOf: 'McDowell working · 11 Jul 2026 · shells modeled (not live TLE)', ... };

// ใหม่ — ผู้อ่านทั้ง 10 จุดไม่ต้องแก้อะไรเลย
const REAL = {
  satsOnOrbit: FACTS['fleet.active'].v,
  customersM:  FACTS['subs.serviceLines'].v,
  markets:     FACTS['markets.served'].v,
  asOf:        F.txt('fleet.active', {lang:'en', style:'bare'}),
  satelliteScale: 1, dishyScale: 100,
  get dishyVis(){ ... }, get modeledSatCount(){ ... },
};
```

`FACTS` ต้องประกาศก่อนบรรทัด 1400 · `STEPS` (~3431) และ `makeLabel` (~3214) อยู่หลังอยู่แล้ว

---

## 6) สิ่งที่ซ่อนไว้ข้างใน

- **การเรนเดอร์ค่า** — number / range 2-tuple / free text, en-dash `–` (ไม่ใช่ hyphen),
  คั่นหลักพัน, `~` จาก `approx`, non-breaking space ระหว่างตัวเลขกับหน่วย
- **หน่วยสองภาษา** — `กม.`/`km`, `ดวง`/`sats`, `นาที`/`min`, `PB/วัน`/`PB/day`
  ปัจจุบันไฟล์นี้เก็บสองสะกดของ fact เดียวกันเป็น literal ที่ไม่รู้จักกัน (บรรทัด 857 กับ 3437)
- **tone → CSS class** และเลือก element (`<b>` ในร้อยแก้ว, `<span class="v">` ใน row)
- **วันที่และ staleness** — ISO เข้า, `14 ก.ค. 2026` หรือ `14 Jul 2026` ออก, TTL ต่างกันตาม tag
  (ยอดดาวเทียม 30 วัน, เอกสาร FCC 365 วัน)
- **การยุบ citation ซ้ำ** — สาม fact ที่อ้าง SPIE 2024 ได้ citation เดียว
- **บัญชี conflict** — ใครถูกใช้ ใครถูกเปิดเผย และ error เมื่อใช้แล้วไม่เปิดเผย
- **ความล้มเหลวแบบไม่ล้มทั้งหน้า** — id ผิดกลายเป็น marker ไม่ใช่ throw

---

## 7) ตัวตรวจ — `scripts/audit-facts.mjs`

ทำตามแบบ `scripts/snapshot-starlink-map.mjs` ที่มีอยู่: รันมือ ไม่ใช่ build step exit 1 เมื่อมี error

**Error:** `unmanaged-literal` · `missing-source` · `undisclosed-conflict` · `unknown-id` · `markup-in-value`
**Warn:** `stale` · `no-callsite` · `ambiguous-scope` · `model-drift` · `too-long`

ตัวที่สำคัญที่สุดคือ **`unmanaged-literal`** — regex หาเลข+หน่วยที่โผล่นอก `F(`:

```
\d[\d,.]*\s*(Gbps|Tbps|Mbps|กม\.|km|ms|GHz|MHz|ดวง|นาที|PB|kg|W)\b
```

นี่คือการยืม `xgettext` ที่สแกนหา untranslated string มาตรง ๆ และเป็น**สิ่งเดียวในทั้งหมดนี้
ที่จะจับ `200 Gbps` ซ้ำสองที่ได้ก่อนที่คนจะไปเจอเอง** — บั๊กต้นเรื่องทั้งหมด

เงื่อนไขที่ทำให้ตัวตรวจเป็นไปได้: **fact id ต้องเป็น string literal เสมอ ห้าม compute**
(gettext บังคับข้อเดียวกันด้วยเหตุผลเดียวกัน)

### เชื่อมกับเอกสารด้วย anchor ไม่ใช่ parser

แทนที่จะเขียน markdown parser มาอ่าน `docs/starlink-specs-2026.md` (465 บรรทัด ร้อยแก้วล้วน
เปราะและต้องเดา mapping ที่เรารู้อยู่แล้ว) ให้ **ฝัง id ลงในเอกสาร**:

```markdown
- อัตราต่อ link: **~100 Gbps** ต่อ transceiver **[ทางการ/รีเวิร์สเอนจิเนียร์]** <!-- fact:isl.rate.perLink -->
```

แล้ว audit เทียบด้วย id — ได้ประโยชน์เท่ากัน ไม่ต้องมี parser และตรวจย้อนได้สองทาง
(fact ไหนไม่มีที่มาในเอกสาร / ตัวเลขไหนในเอกสารยังไม่ได้ขึ้นเว็บ)

---

## 8) สิ่งที่ตัดทิ้งโดยตั้งใจ

| ตัดทิ้ง | เหตุผล |
|---|---|
| `F.value()` | ปนการแสดงผลกับการคำนวณ ใช้ `FACTS['id'].v` แทน |
| `F.en()` แยกเป็น method | ยุบเป็น `opts.lang` |
| `F.both()` แยกเป็น method | conflict เปิดเผยอัตโนมัติอยู่แล้ว |
| `defineFormat()` registry | format registry ผิดรูปเมื่อมี call site แค่ 4 แบบ เพิ่มเป็น function ธรรมดาตอนมีแบบที่ 5 |
| `onChange()` subscription | คุ้มต่อเมื่อมีปุ่มสลับภาษาจริง |
| แปลงหน่วย imperial | หน้านี้ผู้อ่านไทย เก็บฟิลด์ `si` ไว้ ไม่ต้องเขียนโค้ด |
| ICU `plural` | ไทยไม่ผันพจน์ `ดวง` ไม่เปลี่ยนรูป — เหลือแค่ `select` |
| แยก catalog เป็นไฟล์ | CLAUDE.md ระบุว่าทุกอย่างอยู่ใน `index.html` ไฟล์แยกพังใต้ `file://` เหมือน `assets/data/` |
| ดึงทั้งประโยคเข้า catalog | ส่วนที่ผันผวนคือตัวเลข ไม่ใช่ไวยากรณ์ · gettext เองก็ห้าม interpolate กลางประโยค |

---

## 9) ต้นทุนที่ต้องยอมรับ

**อ่าน call site ไม่ออกเหมือนเดิม** `${F('orbit.altitude.real')}` ไม่ได้บอกว่าค่าคืออะไร
ต่างจาก `~340–570 กม.` ที่อ่านปุ๊บรู้ปั๊บ และ grep หา `570` แล้วไม่เจอต้นทางอีกต่อไป
**นี่คือต้นทุนที่แพงที่สุด จ่ายทุกครั้งที่อ่านไฟล์** เพราะผลิตภัณฑ์ของหน้านี้คือร้อยแก้วภาษาไทย
บรรเทาด้วย id ที่อธิบายตัวเอง + `F.audit()` พิมพ์ตาราง id→call site

**ขนาด** ~40 fact × ~12 ฟิลด์ ≈ 450–550 บรรทัดในไฟล์ 4,456 บรรทัด (+11%) และต้องอยู่ก่อนบรรทัด 1400

**ตรวจได้ตอน runtime เท่านั้น** ไม่มี build step แปลว่า id พิมพ์ผิดจะโผล่ตอน step นั้นเรนเดอร์
ส่วน `audit-facts.mjs` เป็น regex จึงมองไม่เห็น id ที่ compute — จึงต้องบังคับให้ id เป็น literal

**เส้นแบ่งที่ยังปิดไม่สนิท** ร้อยแก้วเชิงบรรณาธิการยังเขียนมือ registry กับ note ยัง drift กันได้
แค่แคบลง ไม่ได้หายไป

---

## 10) ลำดับการทำ (ถ้าตัดสินใจลุย)

1. `FACTS` + `SOURCES` + `UNITS` + `F()` + `F.txt()` — วางก่อนบรรทัด 1400
2. ย้าย fact ที่ซ้ำมากที่สุดก่อน: `fleet.active` (13 จุด), `net.latency.land` (5), `orbit.altitude.*` (4)
3. `REAL` → derived · ผู้อ่าน 10 จุดไม่ต้องแก้
4. `F.row()` + `F.note()` → แปลง `.kv` และ note ใน `STEPS`
5. `F.hydrate()` + `data-fact` → markup นิ่ง
6. `scripts/audit-facts.mjs` + ฝัง anchor ลง `docs/starlink-specs-2026.md`
7. `F.audit()` ใน console ตอน boot (dev เท่านั้น)

ทำได้ทีละขั้น แต่ละขั้นหน้าเว็บยังทำงาน ไม่ต้อง big-bang
