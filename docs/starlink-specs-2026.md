# สเปกทางเทคนิค SpaceX Starlink แบบละเอียดยิบ (ฉบับสมบูรณ์ กลางปี 2026)

> เอกสารนี้รวบรวมสเปกจาก (ก) งาน reverse engineering ที่น่าเชื่อถือ และ (ข) เอกสารทางการ/งานวิจัยหลัก ทุกสเปกสำคัญจะมีป้ายระบุแหล่งที่มาและระดับความเชื่อมั่น: **[ทางการ]** = เอกสาร SpaceX/FCC/ITU, **[รีเวิร์สเอนจิเนียร์]** = ได้จากการแกะ/วิเคราะห์อิสระ, **[วัดจริง]** = งานวัดผลเชิงประจักษ์, **[ประมาณการ]** = ประเมิน/อนุมาน คำศัพท์เทคนิคคงไว้เป็นภาษาอังกฤษตามต้นฉบับ
>
> ⚠️ หมายเหตุความน่าเชื่อถือ: ตัวเลขจำนวนดาวเทียม ราคา และสถานะกฎระเบียบเปลี่ยนแปลงเร็วมาก ควรระบุวันที่กำกับเสมอเมื่อนำไปเผยแพร่

---

## 1) โครงสร้างกลุ่มดาวเทียมและวงโคจร (Constellation & Orbital Architecture)

### 1.1 จำนวนดาวเทียมปัจจุบัน (กลางปี 2026)
ข้อมูลจาก Jonathan McDowell (planet4589.org) อัปเดต 11 ก.ค. 2026 **[วัดจริง/tracker]**:
- **ปล่อยสะสม (launched):** 12,472 ดวง
- **อยู่ในวงโคจร (in orbit):** 10,775 ดวง
- **ใช้งานได้ (working):** 10,759 ดวง
- **อยู่ใน operational shell แล้ว:** 9,062 ดวง
- **failed/decaying แต่ยังอยู่ในวงโคจร:** 16 ดวง

หมายเหตุ: SpaceX ในเอกสาร S-1 (SEC) รายงาน "9,600+ deployed" ณ 31 มี.ค. 2026 ซึ่งต่ำกว่าตัวเลข McDowell เพราะนิยาม "operational" ต่างกัน McDowell นับ ~1–2 ดวงตกกลับสู่โลกต่อวัน ตามการวิเคราะห์ SEC S-1 (20 พ.ค. 2026) ของ Axis Intelligence กลุ่มดาวเทียม Starlink "มีมากกว่า 10,413 ดวงที่ใช้งานใน LEO คิดเป็นราว 65% ของดาวเทียมที่ทำงานทั้งหมดที่โคจรรอบโลก" (McDowell บันทึก active 10,413 ดวง ณ 1 มิ.ย. 2026) **[วัดจริง/ทางการ]**

### 1.2 Orbital Shells — Gen1 (ตามใบอนุญาต FCC)
ตารางนี้เป็นค่า "ตามการออกแบบ/ใบอนุญาต" **[ทางการ]** — ในทางปฏิบัติบาง shell ไม่เคยเต็มตามจำนวน (งานวิจัย arXiv 2026 พบ shell 53.0°/552 km ตั้งเป้า 1,584 แต่จริงอยู่ที่ ~1,500)

| Shell | Inclination | Altitude | Planes | Sats/plane | รวม |
|---|---|---|---|---|---|
| 1 | 53.0° | 550 km | 72 | 22 | 1,584 |
| 2 | 70.0° | 570 km | 36 | 20 | 720 |
| 3 | 97.6° (SSO/polar) | 560 km | 6 | 58 | 348 |
| 4 | 53.2° | 540 km | 72 | 22 | 1,584 |
| 5 | 97.6° (polar) | 560 km | 4 | 43 | 172 |

- Shell 1 ครอบคลุมละติจูด ~±53° (~80% ของผิวโลก) **[ประมาณการ]**
- Gen1 มี lower minimum elevation angle ที่ **25°** (ต่างจาก 40° ในบาง shell) **[ทางการ FCC]**
- Phase 1 รวมสูงสุด ~4,408 ดวง

### 1.3 Gen2 shells และการลดระดับปี 2026
- FCC อนุมัติ Gen2 บางส่วน (First Partial Grant, FCC 22-91): **7,500 ดวง** ในย่าน Ku/Ka **[ทางการ]**
- 2022: shells ที่ 525, 530, 535 km
- 2024: เพิ่ม 340, 345, 350, 360 km
- ม.ค. 2026 (FCC): เพิ่ม 355, 365, 475, 480, 485 km และอนุญาตลดจาก 525/530/535 → 480/485/475 km ตามลำดับ **[ทางการ]**
- เหตุผลการลดระดับ: ลด orbital debris — ที่ 480 km ดาวเทียมที่เสียจะ reentry ภายใน ~1–2 ปี (เทียบกับหลายสิบปีที่ระดับสูงกว่า) **[ทางการ]**
- **[ประมาณการ/ยังไม่ยืนยัน]** V3 constellation รอ FCC อนุมัติ (ยังไม่เสร็จ ณ กลางปี 2026); SpaceX ยื่นขอ Gen ใหม่รวม 15,000 ดวง VLEO และมีข่าวยื่นขอถึง 100,000 ดวง V3 (SatNews) — ตัวเลขนี้เป็นการยื่นขอ ไม่ใช่การอนุมัติ; FCC อนุญาตรวม 12,000 ดวง (Gen1) และมีเอกสารยื่นถึง 42,000 ดวง

### 1.4 EPFD / disposal / อายุการออกแบบ
- อายุออกแบบ ~5 ปี **[ทางการ]**
- ใช้ autonomous collision avoidance โดยดึงข้อมูลจากฐาน tracking ของ US DoD; ทำ stationkeeping burn รายวัน **[ทางการ]**
- Gen2 First Partial Grant ให้ waiver: in-band TT&C, downlink PFD limits, และข้อกำหนด ITU EPFD compliance finding ก่อนเริ่มบริการ **[ทางการ FCC DA 24-222]**
- คาดว่าวัสดุ ~95% เผาไหม้หมดตอน reentry **[ทางการ]**

### 1.5 Launch cadence และจำนวนต่อ launch
- Falcon 9: v1.0/v1.5 ~51–60 ดวง/ลำ; **v2 mini ~21–23 ดวง**; **v2 mini optimized ~28–29 ดวง** (มวลลด ~22%) **[ทางการ/ประมาณการ]**
- V3: ต้องใช้ **Starship เท่านั้น** (Falcon 9 บรรทุกไม่ได้) — SpaceX วางแผน ~60 ดวง/Starship เพิ่ม ~60 Tbps/launch (มากกว่า V2 Mini launch ~20 เท่า) **[ทางการ SpaceX progress report]**
- ปี 2026 (ถึง 15 มิ.ย.) ปล่อย ~1,500 ดวงในปีเดียว เฉลี่ย ~1 launch ทุก 3–4 วัน **[วัดจริง]**
- Starship V3 บินทดสอบครั้งแรก 22 พ.ค. 2026 (บรรทุก dummy Starlink 20 ดวง + ดาวทดสอบ "Dodger Dogs" 2 ดวง) **[ข่าว]**; Flight 13 (16 ก.ค. 2026) abort เพราะ 4 engine ไม่จุด ทำให้ V3 ล่าช้า Falcon 9 จึงยังแบกภาระ V2 Mini ต่อ **[ข่าว]**

---

## 2) สเปกฮาร์ดแวร์ดาวเทียมแยกตามรุ่น (Satellite Hardware by Generation)

### 2.1 ตารางเปรียบเทียบมวลและพลังงาน

| รุ่น | มวลปล่อย (kg) | Propellant | ISL laser | หมายเหตุ |
|---|---|---|---|---|
| Tintin (prototype) | ~400 | - | ไม่มี | 2 ดวง (2018) |
| v0.9 | ~227 | krypton Hall | ไม่มี | 60 ดวง (2019) |
| v1.0 | ~260 | krypton Hall | ไม่มี | single solar panel |
| v1.5 | ~295–306 | krypton Hall | มี (laser) | เริ่มมี ISL |
| v2 mini | ~740–800 (batch แรก); optimized ~575 | **argon Hall** | มี (3 links) | bus ใหญ่ ~2 เท่า v1.5 |
| V2 (full-size) | **~1,250 kg (ยาว ~7 m)** | argon Hall | มี | Starship only |
| V3 | ~1,500–2,000 (ยังไม่ยืนยัน) | argon Hall | มี | Starship only |

แหล่งอ้างอิงมวล: Wikipedia/Gunter's Space Page **[รีเวิร์สเอนจิเนียร์/ประมาณการ]**; Spaceflight Now อ้าง v2 mini ~800 kg **[ข่าว/ทางการบางส่วน]** ตาม Gizmodo (ก.พ. 2023) อ้าง SpaceX: "V2 เต็มขนาดยาว 22 ฟุต (7 เมตร) หนักราว 2,755 ปอนด์ (1,250 kg) ส่วนรุ่นก่อนหน้าหนักราว 573 ปอนด์ (260 kg)" **[ทางการ/ข่าว]**

**⚠️ ข้อขัดแย้ง:** มวล V3 มีตัวเลขต่างกันมาก — SatNews (ก.ค. 2026) ว่า ~1,500 kg; Grokipedia/NextBigFuture ว่า ~1,900–2,000 kg ยังไม่มีตัวเลขทางการยืนยัน

### 2.2 Propulsion (Hall-effect thruster)
- v0.9–v1.5: **krypton Hall thruster** — เป็น krypton Hall thruster ตัวแรกที่ใช้งานในอวกาศ **[ทางการ]**
- v2 mini: **argon Hall thruster** — SpaceX ระบุว่า "ดาวเทียม v2 Mini เป็นดาวเทียมชุดแรกที่ใช้ argon thruster บนวงโคจร" **[ทางการ SpaceX via Everyday Astronaut]**
- สเปกที่แม่นยำ: ตาม SpaceNews (28 ก.พ. 2023) อ้าง SpaceX — argon Hall thruster ของ V2 Mini "สร้าง thrust **170 millinewtons** โดยใช้กำลัง **4.2 กิโลวัตต์** … Isp **2,500 วินาที** ซึ่งเป็น thrust 2.4 เท่า และ Isp 1.5 เท่า ของ thruster Starlink รุ่นก่อนหน้า" **[ทางการ]**
- argon ถูกกว่า krypton ~100 เท่า และถูกกว่า xenon ~1,000 เท่า **[ทางการ]**
- ใช้สำหรับ orbit raising, stationkeeping (burn รายวัน), collision avoidance, และ deorbit

### 2.3 Optical Inter-Satellite Laser Links (ISL)
- v2 mini มี **3 optical laser terminals** ต่อดวง **[ทางการ SpaceX progress report]**
- อัตราต่อ link: **~100 Gbps** ต่อ transceiver **[ทางการ/รีเวิร์สเอนจิเนียร์]**
- wavelength: near-infrared (~1550 nm) **[ประมาณการ/รีเวิร์สเอนจิเนียร์]**
- ตัวเลขทั้งเครือข่าย: ตามที่ Travis Brashears (วิศวกร SpaceX) นำเสนอที่ SPIE Photonics West (30 ม.ค. 2024) ระบบ laser ของ Starlink move **"มากกว่า 42 PB ต่อวัน ผ่าน space laser มากกว่า 9,000 ตัว รวม throughput 5.6 Tbps"** ต่อ transceiver 100 Gbps, ระยะ link สูงสุด **5,400 km**, ทำ laser acquisition ~266,141 ครั้ง/วัน และ "ตราบใดที่ยังมีเส้นทางลงพื้นดิน ก็จะได้ uptime 99.99%" **[ทางการ SpaceX]**
- "mini laser" (2024) ออกแบบให้ 25 Gbps ที่ระยะ 4,000 km สำหรับเชื่อมดาวเทียมบุคคลที่สาม **[ทางการ]**
- โครงสร้างมี LISL 4 ตัว (silicon carbide mirror) ตาม FCC filing บางฉบับ; งานวิจัย Carleton (arXiv 2103.00056) วิเคราะห์ permanent/temporary LISL ตามระยะ **[รีเวิร์สเอนจิเนียร์]**

### 2.4 อุปกรณ์อื่น
- Star tracker: heritage จาก Dragon **[ทางการ]**
- single solar panel (v1.x) / dual array (v2, V3) **[ทางการ]**
- v2 mini solar: มีรายงาน 2 panels ~52.5 m² แต่ละอัน **[รีเวิร์สเอนจิเนียร์/ประมาณการ — ไม่ยืนยัน]**
- GPS receiver, reaction wheels, autonomous collision avoidance บนดาวเทียมทุกดวง

### 2.5 การลดความสว่าง (brightness mitigation)
- **DarkSat** (STARLINK-1130, ม.ค. 2020): เคลือบสีดำ low-albedo ด้านหนึ่ง — ลดความสว่างได้ แต่เกิดปัญหาความร้อน **[วัดจริง งานวิจัย A&A]**
- **VisorSat** (STARLINK-1436, มิ.ย. 2020): visor บังแดด โปร่งใสต่อคลื่นวิทยุ; ทุกดวงตั้งแต่ ส.ค. 2020 เป็น VisorSat **[วัดจริง]**
- **v1.5**: ใช้ dielectric mirror film แทน
- magnitude: ตามงานศึกษา multiyear photometric (กล้อง Danish 1.54-m, La Silla / MNRAS) — "ที่ความสูงเดียวกัน median magnitudes คือ **5.37 (v1.0), 6.01 (Gen-2), 6.11 (v1.5), 6.62 (VisorSat) และ 8.43 (DarkSat; N=2)** ซึ่งสว่างกว่าเป้า V≈7 อยู่ ~0.4–1.6 mag" **[วัดจริง]**; Mallama (2020) วัด v1.0 ก่อน VisorSat เฉลี่ย ~4.63 mag และ VisorSat ~5.93 mag (~30% ของความสว่างเดิม)

### 2.6 Direct-to-Cell (D2C) satellites
- payload: **LTE eNodeB** (baseband เหมือน cell tower ภาคพื้น) ทำงานตาม 3GPP Release 17 Supplemental Coverage from Space (SCS) **[ทางการ/ข่าว]**
- band: **PCS 1900 MHz (LTE Band 25)** ของ T-Mobile ในสหรัฐ **[ทางการ FCC SCS license]**
- ทำตัวเป็น "cell tower ในอวกาศ" ต่อกับมือถือ LTE ปกติ ไม่ต้องดัดแปลง
- capacity: ~48 downlink spot beams/ดวง; ตามงาน Mendo et al. (arXiv:2506.00283 "Direct-to-Cell: A First Look into Starlink's DS2D RAN") ประเมินว่า **"ประสิทธิภาพบริการ mobile data DS2D อยู่ราว 4 Mbps ต่อ beam ในสภาพกลางแจ้ง"** (ขยายได้ถึง 12–24 Mbps หากมี spectrum เพิ่ม) **[วัดจริง]** — หมายเหตุ: ตัวเลขที่ตีพิมพ์คือ ~4 Mbps/beam
- อนาคต: SpaceX ตั้งเป้า peak 150 Mbps/user (ผูกกับ V3 + spectrum EchoStar) ทดสอบ ~ปลายปี 2027 **[แผน — ยังไม่ทำได้]**
- สถานะบริการ (2026): มี >650 D2C sats; T-Mobile "T-Satellite" เปิดเชิงพาณิชย์ 23 ก.ค. 2025 (SMS ก่อน), เพิ่ม data ต.ค. 2025; ให้บริการในสหรัฐ + New Zealand (One NZ) + ทดสอบ Australia, Canada, Chile, Japan, Ukraine ฯลฯ **[ทางการ/ข่าว]**

---

## 3) รายละเอียด RF / Spectrum

### 3.1 การจัดสรรความถี่
| ทิศทาง/link | ย่าน | ความถี่ |
|---|---|---|
| User downlink (sat→UT) | Ku | **10.7–12.7 GHz** |
| User uplink (UT→sat) | Ku | **14.0–14.5 GHz** |
| Gateway downlink (sat→GW) | Ka | **17.8–18.6, 18.8–19.3 GHz** |
| Gateway uplink (GW→sat) | Ka | **27.5–29.1, 29.5–30.0 GHz** |
| Gateway (E-band, Gen2) | E | **71–76 GHz (down), 81–86 GHz (up)** |

**[ทางการ FCC]** E-band อนุมัติใน FCC DA 24-222 (Gen2) ตัวอย่าง gateway ที่ Banning, CA ระบุ 27.5–29.1/29.5–30.0/81–86 GHz (Earth-to-space) และ 17.8–18.6/18.8–19.3/71–76 GHz (space-to-Earth) **[ทางการ]** — V-band มีในแผนแต่รายละเอียดสาธารณะยังจำกัด **[ไม่ทราบ]** TT&C ใช้ waiver ตาม FCC filing

### 3.2 Channelization (Ku downlink)
จากงาน UT Austin และ NRAO **[รีเวิร์สเอนจิเนียร์/วัดจริง]**:
- **8 channels × 240 MHz** ครอบคลุม 10.7–12.7 GHz
- channel spacing 250 MHz, guard band 10 MHz ระหว่าง channels
- center ของ channel ที่ i: Fci = 10.7 + F/2 + 0.25(i − 1/2) GHz
- ความถี่เริ่มต้น 8 channels (NRAO): 10.7, 10.95, 11.2, 11.45, 11.7, 11.95, 12.2, 12.45 GHz
- **channel 1–2 ล่างสุดว่างอยู่** เพื่อเลี่ยงรบกวน radio astronomy ที่ 10.6–10.7 GHz **[รีเวิร์สเอนจิเนียร์]**
- polarization reuse: RHCP/LHCP; ในทางปฏิบัติ downlink ใช้ single right polarization ในการรับ (ตามการวิเคราะห์ FCC filing โดย Sergei Pekhterev)
- uplink: 8 channels × 62.5 MHz ใน 14.0–14.5 GHz (รวม 500 MHz) **[รีเวิร์สเอนจิเนียร์/NRAO]**

### 3.3 EIRP / geometry
- SpaceX เสนอ max EIRP density **21.9–29.7 dBW/MHz** ขึ้นกับ altitude **[ทางการ FCC]**
- gateway: ต่อ 1 earth station รับได้สูงสุด 64 co-frequency beams (32 sats × 2 polarization) **[ทางการ FCC]**
- minimum elevation angle: **25°** (gateway ลงถึง 5° ที่ละติจูด >62°) **[ทางการ]**
- ดาวเทียมมี 4 Ku ESA: 1 uplink + 3 downlink, แต่ละ ESA สร้าง 8 beams × 2 polarization → **48 downlink beams + 16 uplink beams** ต่อดวง (downlink/uplink split ~75/25) **[รีเวิร์สเอนจิเนียร์ — Mike Puchol]**
- cell บนพื้นดิน ~25 km (~15 ไมล์) และใช้ระบบ H3 hexagonal ของ Uber ในการแบ่งพื้นที่ **[รีเวิร์สเอนจิเนียร์]**

### 3.4 Modulation / coding
- downlink เป็น **OFDM** ใช้ **4QAM (≈QPSK) และ 16QAM** (สังเกตพบเท่านี้) **[รีเวิร์สเอนจิเนียร์ UT Austin]**
- ใช้ adaptive coding/modulation ตาม SNR; sync ใช้ 4QAM, payload ช่วงต้นบางส่วนอาจ 16QAM
- ไม่ใช่ DVB-S2X มาตรฐาน แต่เป็น proprietary OFDM
- uplink/gateway modulation ยังไม่มีข้อมูลสาธารณะชัดเจน **[ไม่ทราบ]**

---

## 4) โครงสร้างสัญญาณ Downlink จาก Reverse Engineering (สำคัญมาก)

งานหลัก: Humphreys, Iannucci, Komodromos, Graff, "Signal Structure of the Starlink Ku-Band Downlink," **IEEE Trans. Aerospace and Electronic Systems, 2023** (preprint arXiv:2210.11578) และงานต่อเนื่อง Qin et al. (timing), Komodromos et al. (simulator, ION GNSS+ 2023) จาก UT Austin Radionavigation Laboratory **[รีเวิร์สเอนจิเนียร์]**

### 4.1 ตารางพารามิเตอร์ OFDM (ยืนยันตรงจากงาน UT Austin)

| พารามิเตอร์ | สัญลักษณ์ | ค่า |
|---|---|---|
| Channel bandwidth | Fs | **240 MHz** |
| จำนวน subcarriers | N | **1024** |
| จำนวน cyclic prefix intervals | Ng | **32** |
| Frame period | Tf | **1/750 s** (Ff = 750 Hz) |
| Frame guard interval | Tfg | **68/15 = 4.533 µs** |
| จำนวน non-zero symbols/frame | Nsf | **302** |
| จำนวน data symbols/frame | Nsfd | **298** |
| Useful OFDM symbol interval | T = N/Fs | **64/15 = 4.266 µs** |
| Symbol guard interval (CP) | Tg = Ng/Fs | **2/15 = 0.133 µs (130 ns)** |
| OFDM symbol duration | Tsym = T + Tg | **4.4 µs** |
| Subcarrier spacing | F = Fs/N | **234,375 Hz** |
| Channel spacing | Fδ | **250 MHz** |
| Guard band ระหว่าง channels | Fg | **10 MHz** |

### 4.2 โครงสร้าง frame
- 1 frame = 302 symbol interval + frame guard interval, รวม Tf = 1/750 s
- **symbol แรก = PSS** (Primary Synchronization Sequence) มี native time-domain representation
- **symbol ที่สอง = SSS** (Secondary Synchronization Sequence) — anchor ด้วย fixed initial phase เทียบ PSS
- symbol อื่นส่วนใหญ่มี π/4 phase shift เทียบ PSS; symbol สุดท้ายเป็น 4QAM แต่มี π/4 offset
- UT Austin สงสัยว่า SSS อาจเป็น mixture ของ scrambled m-sequences 2 ตัว (คล้าย LTE SSS) แต่ **ไม่ใช่ Zadoff-Chu** แบบ LTE PSS **[รีเวิร์สเอนจิเนียร์]**

### 4.3 ประสิทธิภาพเชิงออกแบบ
- spectral occupancy = Fs/Fδ = 24/25 (guard 10 MHz = >42 subcarrier intervals) — บ่งชี้ว่าตั้งใจเปิดหลาย channel พร้อมกัน และลดต้นทุน UT (sampling rate ต่ำ) **[รีเวิร์สเอนจิเนียร์]**
- OFDM symbol occupancy = N/(N+Ng) = 32/33 — ออกแบบมีประสิทธิภาพสูง
- CP สั้น (130 ns) เพราะ delay spread ในช่อง space-to-Earth ต่ำ (worst-case 95% RMS ~108 ns) **[รีเวิร์สเอนจิเนียร์]**

### 4.4 Timing / synchronization
- **Fixed Assignment Interval (FAI) ~15 วินาที** — ช่วงที่ beam assignment คงที่; sync กับ UTC boundary **[รีเวิร์สเอนจิเนียร์/วัดจริง — Qin et al., Blazquez-Garcia et al. 2023]**
- frame timing sync กับ UTC; งาน timing ศึกษาว่า short-term stability พอสำหรับ pseudorange-based opportunistic PNT หรือไม่
- ตรวจจับ frame ได้ต่ำถึง SNR ~ −15.7 dB (ใช้ PSS อย่างเดียว, PD=0.95) และตรวจสัญญาณจริงได้ที่ ~ −14.5 dB **[รีเวิร์สเอนจิเนียร์]**
- Starlink เผยแพร่ ephemeris (Modified ITC format, position/velocity/covariance, พยากรณ์ 72 ชม. อัปเดตทุก 8 ชม. ที่ 4:30/12:30/20:30 UTC) **[ทางการ]**

### 4.5 อุปกรณ์ capture (เพื่อทำซ้ำงาน)
- parabolic dish + feedhorn + LNB (conversion gain 60 dB, noise figure 0.8 dB), dual-band down-convert 10.7–11.7→950–1950 MHz และ 11.7–12.75→1100–2150 MHz; antenna gain ~40 dBi ที่ 12.5 GHz **[รีเวิร์สเอนจิเนียร์]**
- simulator (MATLAB) เปิด public ที่ gitlab.com/radionavlab/public

### 4.6 งานอิสระอื่น
- Neinavaie/Kassas (UC Irvine/OSU): Doppler tracking, carrier-phase positioning, "Unveiling beamforming strategies of Starlink LEO satellites" **[รีเวิร์สเอนจิเนียร์]**
- Jardak & Adam (2023, Sensors): ใช้ Starlink downlink tones positioning ด้วย receiver 1 MHz; งาน Doppler ก่อนหน้าใช้ receiver 2.5 MHz **[รีเวิร์สเอนจิเนียร์]**
- uplink: ยังมีการ reverse engineer สาธารณะน้อยมาก **[ไม่ทราบ]**

---

## 5) User Terminal Hardware — ทุกรุ่น พร้อมรายละเอียด teardown

### 5.1 ตารางเปรียบเทียบรุ่นหลัก

| รุ่น | ขนาด | น้ำหนัก | FOV | Power | Router Wi-Fi |
|---|---|---|---|---|---|
| Rev1 (round "Dishy McFlatface") | เส้นผ่าศูนย์กลาง 59 cm | ~ | 100° | ~100 W | 802.11ac |
| Rev2 (Standard Actuated, rectangular) | 20.2×11.9 in | ~6.4 lb (dish) | 100° | 50–75 W | 802.11ac |
| Standard (Gen 3) | ~19×11 in (15.07×23.4 in ตามบางแหล่ง) | ~4.2 kg | 110° | 75–100 W (idle ~45 W) | Wi-Fi 6 |
| Mini | 11.75×10.2 in (~29.8×25.9 cm) | ~1.1 kg (2.4–2.56 lb) | 110° | 25–40 W (peak ~60–75 W) | Wi-Fi 5 (integrated) |
| Performance / Flat High Performance | ใหญ่กว่า | ~ | **140°** | สูงสุด ~180 W | - |

**[รีเวิร์สเอนจิเนียร์/ผู้ผลิต]** IP rating: Mini IP67; Standard Gen 3 IP67; Performance ใหม่ IP69K
- Standard Gen 3 ตัด actuator/มอเตอร์ออก (เล็งด้วยมือผ่าน app + kickstand) เพราะมีดาวเทียมพอแล้ว
- รุ่นเฉพาะทาง: Business, Flat High Performance for mobility, Maritime, Aviation (Aero terminal) — ใช้ dish ตระกูล Performance

### 5.2 Phased Array — สถาปัตยกรรม (จาก teardown)
Rev1 (round dish) — จาก Ken Keiter teardown + The Signal Path (Shahriar Shahramian) X-ray analysis **[รีเวิร์สเอนจิเนียร์]**:
- **1,280 antenna elements** (รวม peripheral dummy elements เพื่อ absorb surface wave/impedance matching) บน antenna board
- RF board มี **80 large RF chips + 640 small RF chips** (CMOS เพื่อลดต้นทุน)
- โครงสร้าง stack-up: radome → cell isolation array → antenna board → RF board → back plate (ยึดด้วยกาวจำนวนมาก แกะยาก)
- element เป็น electromagnetic band gap / stacked patch, honeycomb spacer
- gain ~33 dBi (บางแหล่งวิเคราะห์), ทำงานที่ 14 GHz uplink, ~1,200 elements **[รีเวิร์สเอนจิเนียร์ — abgoyal analysis]**

Gen 3 (ตามชุมชน teardown):
- รวม control ลงเหลือ **6 beamformer ASIC** (ชื่อไม่เป็นทางการ "Shiraz" แต่ละตัวคุม ~200 elements) + Front-End Module ("Pulsar") daisy-chain คุม 2–4 elements/ตัว **[รีเวิร์สเอนจิเนียร์ — ชื่อไม่เป็นทางการ]**

### 5.3 Compute / boot chain
- **custom quad-core ARM Cortex-A53 SoC** ของ SpaceX **[รีเวิร์สเอนจิเนียร์ — DEF CON]**
- verified boot บน ARM Trusted Firmware (TF-A); early-stage TF-A bootloaders และโดยเฉพาะ **immutable ROM bootloader** มี custom fault injection countermeasures
- hardware_version string ตัวอย่าง: "rev3_proto2"

### 5.4 SECURITY RESEARCH — Lennert Wouters (KU Leuven COSIC)
งาน "Glitched on Earth by Humans: A Black-Box Security Evaluation of the SpaceX Starlink User Terminal" (Black Hat USA / DEF CON 30, 2022) **[รีเวิร์สเอนจิเนียร์]**:
- สร้าง **modchip ราคา ~$25** (microcontroller คลาส Raspberry Pi/RP2040, flash, electronic switches, voltage regulator) ติดบน UT board — ต้อง solder สายเพิ่ม (ดึง 12V จาก UT, ต่อ enable pin ของ voltage regulator เพื่อ power cycle, และ 1.8V สำหรับ level shifter)
- ใช้ **voltage fault injection (glitching)** ระหว่าง ROM bootloader ทำงาน เพื่อ **bypass firmware signature verification**
- โหลด patched firmware บน bootloader ถัดไป → ได้ **root / arbitrary code execution**
- เนื่องจากช่องโหว่อยู่บน ROM bootloader ที่ burn ลง SoC (แก้ไม่ได้ผ่าน update) จึงเป็น **"unfixable compromise"** — เป็น prerequisite สำหรับสำรวจเครือข่าย Starlink อย่างอิสระ
- ใช้ทวีตประกาศ talk ผ่าน UT ที่ root แล้ว (อ้างว่าอาจเป็นทวีตแรกที่ส่งผ่าน Starlink UT ที่ถูก root)
- disclose ผ่าน SpaceX Bug Bounty (ได้ขึ้น hall of fame); SpaceX ตอบด้วยเอกสาร 6 หน้า + firmware update ที่ "ทำให้โจมตียากขึ้นแต่ไม่ถึงกับเป็นไปไม่ได้"
- เปิด modchip design บน GitHub
- teardown อ้างอิงในงาน: Ken Keiter, MikeOnSpace (part 1/2), The Signal Path, Colin O'Flynn (Rev2 UART/Reset/Boot glitches), Dan Murray (Dishy V3)

### 5.5 สาย/power
- Standard Gen 3: AC brick → 48V DC ไปที่ dish; รวมสาย 75 ft (proprietary connector); แยก power supply ออกจาก router **[ผู้ผลิต]**
- Rev1/Rev2 ใช้ PoE injector (48–56V)
- Mini: USB-C PD input ≥65 W (20V/5A min), barrel-jack DC, มี AC brick ด้วย; router ในตัว (Wi-Fi 5, ~930 ตร.ฟุต, แนะนำ 8–15 อุปกรณ์) **[ผู้ผลิต]**
- Mini ไม่มี Ethernet port ในตัว ต้องใช้ USB-C→Ethernet adapter แยก (~$25); มี snow-melt heater (กินไฟเพิ่มในอากาศเย็น)

---

## 6) Software / API / Protocol Surface (สำหรับส่วน dev/hacking ของเว็บ)

### 6.1 Local gRPC API
- endpoint: **192.168.100.1:9200** (Android app ใช้ 9201); browser app ที่ http://192.168.100.1 **[รีเวิร์สเอนจิเนียร์ — sparky8512/starlink-grpc-tools]**
- service: `SpaceX.API.Device.Device`, method หลัก = **Handle** (รับ 1 request message, ตอบตาม request)
- มี **server reflection** เปิดอยู่ → ดึง protoset ได้ด้วย grpcurl:
  `grpcurl -plaintext -protoset-out dish.protoset 192.168.100.1:9200 describe SpaceX.API.Device.Device`
- SpaceX เปิด .proto สาธารณะเพียงบางส่วน (ณ พ.ค. 2025) — โปรเจกต์ชุมชนใช้ reflection/yagrc แทน

### 6.2 RPCs ที่มี (บางตัวไม่ implement/"not authorized")
- **get_status, get_history, get_device_info, get_obstruction_map, get_diagnostics, reboot, dish_stow (stow/unstow), set_config**
- reboot/stow ทำง่ายด้วย grpcurl; บาง request เฉพาะ router / บางตัวคืน default เพราะไม่ implement

### 6.3 Telemetry fields (จาก starlink_grpc.py)
- throughput: uplink/downlink (bps)
- **pop_ping_latency_ms, pop_ping_drop_rate**
- **obstruction_duration / obstruction_fraction** (obstruction_detail mode เริ่มไร้ประโยชน์เพราะ firmware ใหม่ obsolete 2 attribute)
- SNR fields — **deprecated** (firmware ใหม่รายงาน 0.0)
- alerts (alert_detail), GPS stats/sats (gps_sats), boot count
- **software_version** (เช่น "…uterm.release"), **hardware_version** (เช่น "rev3_proto2"), country_code, id
- sample interval = 1 วินาที; total packet loss = total_ping_drop / samples
- location/GPS group ต้องเปิดผ่าน app (Settings→Advanced→Debug Data→allow access on local network)

### 6.4 Monitoring stack ของชุมชน
- dish_grpc_text.py, dish_grpc_influx.py, dish_grpc_prometheus, dish_grpc_mqtt → **InfluxDB / Prometheus / Grafana / MQTT**
- Docker image: ghcr.io/sparky8512/starlink-grpc-tools (multi-arch amd64/arm64); ตั้ง systemd service ได้

### 6.5 Network behavior
- **CGNAT** เป็นค่า default (IPv4 ในช่วง 100.64.0.0/10); **ไม่มี port forwarding** **[รีเวิร์สเอนจิเนียร์/ผู้ผลิต]**
- **IPv6:** ทุก router รองรับ, ได้ **/56 prefix delegation** ต่อระบบ; แต่ router มาตรฐานไม่ให้ตั้ง firewall rule เอง → ต้อง 3rd-party router (bypass mode)
- **Public IPv4:** มีเฉพาะ Priority/Local Priority (optional); Residential/Roam เป็น CGNAT (dynamic)
- outbound TCP/25 และ TCP/445 ถูกบล็อกเพื่อความปลอดภัย
- ASN: **AS14593 (SPACEX-STARLINK)** และ AS27277 **[รีเวิร์สเอนจิเนียร์]**
- geolocation มักผิดเพราะ traffic ออกที่ PoP; ความเร็ว Residential ทั่วไป 50–150 Mbps down / 5–25 Mbps up, Priority 50–220 down / 10–30 up (Starlink Finnish transparency disclosure)

---

## 7) สถาปัตยกรรมเครือข่ายและ Ground Segment

### 7.1 Gateway / teleport
- ต่อ site ทั่วไปมี **9 antenna** (จัดเรียง 3×3, 4×5 หรือ 1×9) — 8 ใช้งาน + 1 standby/spare **[รีเวิร์สเอนจิเนียร์ — Mike Puchol]**
- Community/Bonded Gateway: parabolic Ka ในโดม (spherical radome) เส้นผ่าศูนย์กลาง ~1.4–2.1 m, ~250 kg/ตัว; กำลัง ~1 kW/ตัว (4 kW ในหิมะ); ต้องเห็นฟ้า ≥25°; ให้ IPv4 up to /24, IPv6 up to /56 **[ทางการ Speedcast]**
- 2 parabolic Ka gimbaled antenna บนดาวเทียมให้ ~20 Gbps ต่อ gateway; 1 gateway 8 antenna ~40–80 Gbps aggregate **[รีเวิร์สเอนจิเนียร์]**
- มี gateway 200+ แห่งทั่วโลก (US หนาแน่นสุด 50+, Europe 30+); E-band gateway เพิ่มขึ้นใน Gen2 **[ประมาณการ]**

### 7.2 เส้นทาง packet
UT (Ku) → satellite → [ISL laser ถ้าไม่มี gateway ในระยะ] → satellite ที่เห็น gateway → gateway (Ka) → PoP → fiber backbone/peering (Google, Netflix, Cloudflare) → ปลายทาง **[รีเวิร์สเอนจิเนียร์/ทางการ]**
- one-way UT→sat ~3–4 ms; แต่ละ laser hop ~1–3 ms; backbone ~5–30 ms
- laser ในสุญญากาศเร็วกว่า fiber ~47% (299,792 vs ~200,000 km/s) → ได้เปรียบเส้นทางไกลข้ามทวีป

### 7.3 Handover / scheduling
- reconfiguration interval **15 วินาที** sync ทั่วโลก ทำให้เกิด latency/throughput variation เป็นคาบ **[วัดจริง — Mohan et al. WWW 2024]**
- เลือกดาวเทียมตาม elevation/geometry; handoff ทุก 15–90 วินาที **[วัดจริง]**

### 7.4 Capacity / congestion
- แต่ละ cell แชร์ bandwidth; Residential ได้ priority สูงกว่า Roam; Priority plan มี dedicated Ka beam allocation **[ทางการ]**
- congestion เป็นตัวกำหนดความเร็วหลัก (cell ในเมืองที่มีผู้ใช้มากจะช้ากว่า cell ชนบท แม้ดาวเทียมเดียวกัน)

---

## 8) ประสิทธิภาพจริงจากงานวิจัย (Measured Real-World Performance)

### 8.1 งานวัดผลหลัก
- **Michel, Trevisan, Giordano, Bonaventure, "A First Look at Starlink Performance," IMC 2022** (DOI 10.1145/3517745.3561416): วัดจากเบลเยียม ต้นปี 2022 — latency ต่ำและไม่แปรปรวนมากเมื่อ link ว่าง/โหลดเบา; วัด throughput ผ่าน TCP/QUIC, latency, packet loss **[วัดจริง]**
- **Mohan et al., "A Multifaceted Look at Starlink Performance," ACM Web Conference (WWW) 2024**: ใช้ M-Lab 19.2M speed tests จาก 34 ประเทศ + RIPE Atlas + ทดลอง Zoom/Luna cloud gaming เทียบ 5G/fiber; ยืนยันผลกระทบของ **"15-second reconfiguration interval"** ที่ทำให้ latency/throughput แปรปรวนมาก **[วัดจริง]**
- Kassem et al. "A Browser-side View of Starlink Connectivity" (IMC 2022); Ma et al.; Pan/Zhao/Cai; Ookla Speedtest quarterly; Cloudflare Radar; APNIC Blog **[วัดจริง]**

### 8.2 ตัวเลขทั่วไป
- latency (RTT) median ~20–60 ms; มี spike ที่ขอบ 15 วินาที; มี jitter/bufferbloat ภายใต้โหลด **[วัดจริง]**
- throughput ผู้ใช้ทั่วไป ~50–200 Mbps down, ~10–40 Mbps up (แปรตามภูมิภาค/เวลา/congestion) **[วัดจริง]**
- Finland FHP study: throughput เฉลี่ย ~80 Mbps, degrade เล็กน้อยเมื่อเคลื่อนที่ **[วัดจริง]**
- rain fade มีผล (Ka ไวต่อฝนกว่า Ku); obstruction ลด performance; TCP/QUIC ทำงานได้แต่ได้รับผลจาก 15-s boundary

### 8.3 ตารางเปรียบเทียบ (คร่าว ๆ) **[ประมาณการ/วัดจริงรวม]**

| ระบบ | latency ทั่วไป | down ทั่วไป |
|---|---|---|
| Starlink LEO | 20–60 ms | 50–200 Mbps |
| GEO (Viasat/HughesNet) | 600–700 ms | 25–100 Mbps |
| OneWeb LEO | ~70–110 ms | B2B เป็นหลัก |
| Amazon Leo (Kuiper) | ยังไม่เปิดเชิงพาณิชย์ (กลางปี 2026) | - |
| Fiber | 5–15 ms | 100–1000+ Mbps |
| 5G FWA | 15–50 ms | 100–400 Mbps |

---

## 9) แผนบริการ ราคา และความพร้อมใช้งาน (กลางปี 2026)

> ⚠️ ราคาปรับหลายครั้งในปี 2026 (residential ขึ้นราคา มิ.ย. 2026; Priority overhaul 15 ก.ค. 2026; ค่าเช่า dish $10/เดือน เริ่ม 16 มิ.ย. 2026; Global Roam ยกเลิก 15 ก.ค. 2026) ตัวเลขส่วนใหญ่จาก tracker บุคคลที่สาม (MIRC/rvmobileinternet.com น่าเชื่อถือสุดสำหรับการเปลี่ยนแปลงล่าสุด) ไม่ใช่จาก starlink.com โดยตรงทั้งหมด

### 9.1 แผนหลัก (US, USD)
- **Residential 100 (Lite):** ~$50–55/เดือน, up to ~100 Mbps, deprioritized ตอน congestion
- **Residential 200:** ~$80–85/เดือน, up to ~200 Mbps
- **Residential MAX:** ~$120–130/เดือน, up to ~400 Mbps, priority สูงสุด, unlimited
- **Standby Mode:** $5/เดือน (ใหม่ 2026)
- **Roam 50GB:** ~$50/เดือน; **Roam 100GB:** ~$55/เดือน; **Roam 300GB:** ~$80/เดือน; **Roam Unlimited:** ~$165–175/เดือน (จำกัดใช้ต่างประเทศ 30 วัน ตั้งแต่ 15 ก.ค. 2026)
- **Local Priority:** terminal fee ~$30/เดือน + data ($25/50GB หรือ $125/500GB); in-motion ≤350 mph; หมด bucket ลดเหลือ 1 Mbps down / 0.5 Mbps up
- **Global Priority:** terminal fee ~$150/เดือน + data ($100/50GB หรือ $500/500GB); ocean-capable, ≤550 mph
- **Business:** $250+/เดือน; SLA uptime 99.9%
- **Global Roam ยกเลิก** สำหรับลูกค้าใหม่ 15 ก.ค. 2026 (ให้ย้ายไป Global Priority)

### 9.2 ราคาฮาร์ดแวร์ (US, USD)
- **Standard (Gen 3) Kit:** ~$349 (เดิม $599); เช่าได้ $10/เดือน (ลูกค้า residential ใหม่ไม่ได้เป็นเจ้าของ dish โดย default ตั้งแต่ 16 มิ.ย. 2026)
- **Mini Kit:** $199–249 (ตัวเลขขัดแย้งตามแหล่ง/วันที่)
- **Performance Kit** (แทน Flat High Performance): ~$1,999
- **Flat High Performance** (กำลังเลิก): เดิม ~$2,500
- อาจมี **congestion/demand surcharge** ครั้งเดียว $100–1,500 ในพื้นที่แออัด

### 9.3 T-Satellite (D2C) ราคา
- add-on **$10/เดือน/line** (T-Mobile หรือ any-carrier); ฟรีในแผน T-Mobile ระดับสูง (Experience Beyond); Text-to-911 ฟรีทุกคนที่มีอุปกรณ์รองรับ (~60 รุ่น)

### 9.4 สถานะ Starlink ในประเทศไทย (สำคัญสำหรับผู้อ่านไทย)

**สรุป: ณ กลางปี 2026 Starlink ยังไม่ได้รับใบอนุญาตให้บริการเชิงพาณิชย์แก่ผู้บริโภคทั่วไปในไทยอย่างเป็นทางการ** **[ทางการ/ข่าว]**

หลักฐานฝั่ง "ยังไม่เปิด" (น่าเชื่อถือกว่า):
- แผนที่ availability ทางการของ Starlink ระบุไทยเป็น **"Coming Soon / Pending Regulatory Approval"** (ข้อมูล พ.ค. 2026 — TECHi, Kaohoon International; Statista ก็จัดไทยอยู่กลุ่ม pending regulatory approval)
- **Developing Telecoms:** "Starlink ยังไม่ถูกกฎหมายในไทย เพราะยังไม่ได้รับใบอนุญาตจาก NBTC"; DES เตรียมปราบปรามการลักลอบนำเข้า kit ที่แก๊งคอลเซ็นเตอร์ชายแดนใช้
- **Nation Thailand (2025):** DES ปฏิเสธข้อเสนอ Starlink เพราะ SpaceX ต้องการตั้งบริษัทถือหุ้นต่างชาติ 100% ซึ่งขัดกฎหมายโทรคมนาคมไทย + กังวลความมั่นคง
- **Lawfare/TS2:** พ.ค. 2023 ยึด Starlink dish 134 ชุดที่ลักลอบเข้าไปยัง compound หลอกลวงชายแดน; กฎหมายไทยถือว่าอุปกรณ์โทรคมนาคมไม่มีใบอนุญาตเป็นสิ่งผิดกฎหมาย
- ที่ยืนยันได้มีเพียง **โครงการทดลอง (sandbox)** ร่วมกับ ม.สงขลานครินทร์ (PSU) ระหว่าง 1 เม.ย.–27 ก.ย. 2024 (180 วัน) เพื่อค้นหา-กู้ภัยทางทะเล การศึกษาทางไกล และ telemedicine ในจังหวัดกาญจนบุรี ภายใต้การอนุญาตใช้ดาวเทียมต่างชาติจาก NBTC — **ไม่ใช่บริการเชิงพาณิชย์** (Bangkok Post, PSU)
- ทางเลือก LEO ที่ถูกกฎหมายในไทยคือ **Eutelsat OneWeb** ผ่าน National Telecom (NT)

หลักฐานฝั่ง "เปิดแล้ว" (อ่อนกว่า/น่าจะไม่ถูกต้อง):
- บล็อก Phuket Expat Guide อ้างว่า Starlink ใช้ได้ทั่วไทยตั้งแต่ พ.ย. 2023, สั่งซื้อที่ starlink.com ได้, ~฿2,900/เดือน, ฮาร์ดแวร์ ~฿14,900 — **ตัวเลขนี้มาจากบล็อกเดียว ไม่ได้รับการยืนยันจากแหล่งทางการ ให้ถือเป็นราคา grey-market ที่ยังไม่ยืนยัน และขัดกับสถานะบนแผนที่ทางการของ Starlink**

กรอบกฎหมายไทย: ผู้ให้บริการดาวเทียมต่างชาติต้องได้ **Foreign Satellite Approval (Landing Rights) + Type III Telecommunications Business License** ภายใต้ Telecommunications Business Act 2001 และประกาศ NBTC; ค่าธรรมเนียม landing right ครั้งเดียว THB 2,000,000 ต่อ filing/NGSO system (Formichella & Sritawat) **[ทางการ]**

---

## 10) ส่วนเสริมสำหรับเว็บ

### 10.1 อภิธานศัพท์ (Glossary) ไทย + English
- **LEO (Low Earth Orbit):** วงโคจรต่ำ ~340–570 km สำหรับ Starlink
- **VLEO (Very Low Earth Orbit):** วงโคจรต่ำมาก ~340 km (Gen2 บางส่วน)
- **Phased array:** สายอากาศจัดเฟส บังคับทิศลำคลื่นด้วยอิเล็กทรอนิกส์ ไม่มีการหมุนกลไก
- **ESA (Electronically Steered Antenna):** สายอากาศบังคับทิศเชิงอิเล็กทรอนิกส์
- **ISL (Inter-Satellite Link):** ลิงก์ระหว่างดาวเทียม (Starlink ใช้ laser/optical)
- **OFDM:** Orthogonal Frequency-Division Multiplexing — วิธีมอดูเลตของ downlink
- **PSS/SSS:** Primary/Secondary Synchronization Sequence — sync ต้น frame
- **CP (Cyclic Prefix):** guard interval ต้น OFDM symbol
- **EIRP:** Effective Isotropic Radiated Power — กำลังแผ่รวม
- **EPFD:** Equivalent Power Flux Density — เกณฑ์ ITU คุมการรบกวน
- **CGNAT:** Carrier-Grade NAT — แชร์ IPv4 สาธารณะ ทำให้ port forward ไม่ได้
- **Gateway/PoP:** สถานีภาคพื้น/จุดเชื่อมอินเทอร์เน็ต (Point of Presence)
- **Ku/Ka/E-band:** ย่านความถี่ (~12–18 / ~27–40 / ~71–86 GHz)
- **UT (User Terminal):** จานผู้ใช้ ("Dishy McFlatface")
- **Hall thruster:** เครื่องยนต์ไฟฟ้าไอออน (krypton/argon)
- **D2C (Direct to Cell) / SCS (Supplemental Coverage from Space):** เชื่อมมือถือ LTE ตรงกับดาวเทียม
- **PNT:** Positioning, Navigation, and Timing

### 10.2 Timeline สำคัญ
- 2018: Tintin A/B prototype 2 ดวง
- พ.ค. 2019: v0.9 ปล่อย 60 ดวงแรก
- 2020: DarkSat (ม.ค.), VisorSat (มิ.ย.); "Better Than Nothing" beta
- 2021: v1.5 (เริ่ม laser ISL); ครบ shell 1 (พ.ค.)
- 2022: Lennert Wouters เจาะ UT ที่ Black Hat/DEF CON; Humphreys reverse-engineer downlink
- ก.พ. 2023: v2 mini (Starlink 6-1) — argon thruster ตัวแรกในอวกาศ
- ม.ค. 2024: D2C ดวงแรก; SPIE report 42 PB/วัน
- 2024: Mini เปิดตัว
- ก.ค. 2025: T-Satellite เชิงพาณิชย์
- พ.ค. 2026: Starship V3 บินแรก + ทดสอบ V3 hardware ("Dodger Dogs")
- มิ.ย. 2026: ทะลุ 10,000 ดวงในวงโคจร; SpaceX เป็นบริษัทมหาชน

### 10.3 ข้อจำกัด/คำวิจารณ์
- **ดาราศาสตร์แสง:** brightness ยังเกินเป้า IAU 7 mag (VisorSat median ~6.6, v1.5 ~6.1); streak บนภาพ long-exposure **[วัดจริง]**
- **ดาราศาสตร์วิทยุ:** ประสานงาน NRAO/SKA; เลี่ยงย่าน radio astronomy 10.6–10.7 GHz (channel ล่างสุดว่าง) **[รีเวิร์สเอนจิเนียร์/ทางการ]**
- **space debris/collision:** Starlink เป็นแหล่ง conjunction/collision hazard อันดับต้น ๆ เพราะจำนวนมหาศาล **[วัดจริง/ข่าว]**
- **ozone/atmospheric reentry:** งานวิจัยกังวลว่า alumina (aluminium oxide) จาก reentry อาจเร่งปฏิกิริยาทำลาย ozone (คาดการณ์อาจถึงหลายพัน–หมื่นตัน/ปีในช่วง 2030s) — **เป็นการคาดการณ์ ยังไม่ยืนยัน** **[ประมาณการ]**

### 10.4 ความเข้าใจผิดที่พบบ่อย (debunk)
- "550 km เป็นระดับเดียว" — ผิด; มีหลาย shell 340–570 km (Gen2 ต่ำกว่า ISS ได้)
- "Mini ช้ากว่า Standard เพราะจานเล็ก" — ความเร็วขึ้นกับ constellation + plan เป็นหลัก ไม่ใช่ตัวจาน (แต่ Standard tracking/FOV ต่างและอาจดีกว่าในบางสภาพ)
- "Starlink ถูกกฎหมายในไทยแล้ว" — ยังไม่ถูกต้อง ณ กลางปี 2026
- "42 GB/วัน ผ่าน laser" — ที่ถูกคือ 42 **PB**/วัน (42 ล้าน GB)
- "ดาวเทียม deorbit ไปกองที่ระดับเดียว" — ไม่มี deorbit shell ถาวร; ค่อย ๆ ลดวงโคจรจนเผาไหม้
- "V3 บิน Falcon 9 ได้" — ไม่ได้ ต้องใช้ Starship

---

## แหล่งอ้างอิง (จัดกลุ่ม)

**เอกสารทางการ (SpaceX/FCC/ITU)**
- FCC 22-91 (Gen2 First Partial Grant); FCC DA 24-222 (Gen2 E-band 71–76/81–86 GHz); FCC order ม.ค. 2026 (shell 480 km)
- SpaceX Starlink Progress Report 2024/2025; SpaceX EU Prospectus (5 มิ.ย. 2026); SEC Form S-1 (20 พ.ค. 2026)
- starlink.com (Direct to Cell PDF, Community Gateway, availability map); Starlink Space Safety docs
- SpaceX @ SPIE Photonics West (Travis Brashears, ม.ค. 2024) — laser figures
- SpaceNews (28 ก.พ. 2023) — argon thruster 170 mN / 4.2 kW / 2,500 s

**Reverse engineering / security**
- Humphreys, Iannucci, Komodromos, Graff, "Signal Structure of the Starlink Ku-Band Downlink," IEEE TAES 2023 (arXiv:2210.11578)
- Qin et al., "Timing Properties of the Starlink Ku-Band Downlink"; Komodromos et al., "Signal Simulator for Starlink Ku-Band Downlink" (ION GNSS+ 2023); gitlab.com/radionavlab/public
- Neinavaie & Kassas (unveiling beamforming/OFDM-like structure); Jardak & Adam (Sensors 2023)
- Lennert Wouters (KU Leuven imec-COSIC), "Glitched on Earth by Humans," Black Hat USA / DEF CON 30 2022
- Ken Keiter teardown; The Signal Path (Shahriar Shahramian) X-ray analysis; Colin O'Flynn; Mike Puchol (mikepuchol.com); abgoyal.com RF deep-dive
- Chaudhry & Yanikomeroglu, "Laser Inter-Satellite Links in a Starlink Constellation" (IEEE VTM 2021, arXiv:2103.00056)
- sparky8512/starlink-grpc-tools (GitHub); Mendo et al. "Direct-to-Cell: A First Look into Starlink's DS2D RAN" (arXiv:2506.00283)

**งานวัดผล (measurement)**
- Michel et al., IMC 2022 (DOI 10.1145/3517745.3561416); Mohan et al., WWW 2024; Kassem et al. IMC 2022; APNIC Blog
- Ookla Speedtest; M-Lab; RIPE Atlas; Cloudflare Radar

**Trackers**
- Jonathan McDowell (planet4589.org); CelesTrak; orbitalradar.com; azmth.space

**ดาราศาสตร์/brightness**
- Tregloan-Reed et al. (A&A 2020/2021, DarkSat/VisorSat); Mallama (arXiv 2006.08422 ฯลฯ); MNRAS multiyear photometric study (Danish 1.54-m, La Silla)

**ไทย/regulatory**
- Bangkok Post (NBTC sandbox); Developing Telecoms; Nation Thailand; Lawfare/TS2; Formichella & Sritawat (fosrlaw.com); Lexology; PSU; TECHi/Kaohoon International (availability map); Statista

---

*หมายเหตุสุดท้าย:* ค่าที่ระบุ **[ประมาณการ]** หรือ **[ไม่ทราบ]** ควรตรวจสอบซ้ำก่อนอ้างอิงบนเว็บ และควรใส่วันที่กำกับตัวเลขที่เปลี่ยนแปลงเร็ว (จำนวนดาวเทียม ราคา สถานะกฎระเบียบไทย) เสมอ เอกสารนี้ไม่ได้เติมทุกช่องในตารางเมื่อไม่มีข้อมูลยืนยัน — ความถูกต้องสำคัญกว่าความครบถ้วน