// 罐子 网页版的规矩（第一个，第 16 天 14:30，照 ~/碰/罐子/罐子.py v7 一行一行搬过来的；改规矩先改 py，再搬，再跑 test/对.sh）
const DAYS = ['礼拜一', '礼拜二', '礼拜三', '礼拜四', '礼拜五', '礼拜六', '礼拜天'];
const SPOTS = ['面包房', '站牌', '岗亭', '墙根'];
const WHERE = {'面包房': '面包房门口', '站牌': '站牌底下', '岗亭': '岗亭边上', '墙根': '墙根'};
const HOT = new Set([0, 2, 4, 5, 6]);
const SWEEP = new Set([1, 3]);
const INSPECT = 2;
const MELON = new Set([4, 5]);

function gzRun(acts) {
  const can = {at: null, water: 0, note: '', last: null};
  let away = 0, baker = 0, bakerKind = false, wangKind = false, wangN = 0, flourNew = false;
  let wangLooked = false, bakerLooked = false;
  const NUM = '零两四六八十';
  const tea = () => {
    const n = wangN * 2;
    return n <= 10 ? `底下沉着${NUM[Math.min(wangN, 5)]}片茶叶。` : '底下沉着一小撮茶叶。';
  };
  const flour = () => flourNew ? '罐子口沾着湿面粉。' : '罐子口一圈干了的面粉。';
  const out = [];
  let table = [];
  let k = 0, g = -1;
  while (true) {
    g += 1;
    const d = g % 7, wk = Math.floor(g / 7);
    let act;
    if (d < 6) {
      if (k >= acts.length) return {out, who: null, g};
      act = acts[k]; k += 1;
    } else act = '礼拜天';
    if (d === 0) out.push(`\n====== 第${'一二三四五六七八'[wk]}个礼拜 ======`);
    const lines = [];
    const row = {day: DAYS[d], you: '', can: [], dog: ''};
    if (act === '不去' || act === '礼拜天') {
      row.you = act === '不去' ? '没来' : '你出门了';
    } else {
      if (d === 1 && wk === 0) lines.push('站牌柱子上新贴了一张纸：明日上午区里检查，请保持门前整洁。');
      if (g > 0) {
        if (can.at === null) lines.push('罐子没了。你在垃圾站边上另找了一个，黄桃罐头的，涮了涮。');
        else lines.push(can.note || `罐子在${can.at}。`);
      }
      if (act === '__看') {
        out.push(`—— ${DAYS[d]} ——`);
        out.push(...lines);
        return {out, who: 'peek', g};
      }
      if (act === '原地') {
        if (can.at === null) {
          const lw = can.last || '站牌';
          lines.push(`原地什么也没有。你把新找的罐子放回${WHERE[lw]}，装满了水。`);
          can.at = lw; can.water = 2;
          row.you = `原地添水（没了，放回${lw}）`;
        }
        if (!row.you) {
          row.you = `原地添水（${can.at}）`;
          lines.push('你在原地把罐子装满了水。');
        }
      } else {
        can.at = act; can.last = act;
        row.you = `放在${act}`;
        can.water = 2;
        lines.push(`你把罐子放在${WHERE[can.at]}，装满了水。`);
      }
      can.water = 2;
    }
    can.note = '';
    flourNew = false;
    const story = [];
    let hidden = false;
    const insp = (d === INSPECT && wk === 0);
    const at = can.at;
    if (at === '站牌' && (SWEEP.has(d) || insp)) {
      story.push('早上八点清扫的来了，站牌底下归街道，罐子扔进车斗');
      can.at = null; can.water = 0;
    } else if (at === '墙根' && insp) {
      story.push('区里来人前，清扫的把墙根也扫了，罐子扔进车斗');
      can.at = null; can.water = 0;
    } else if (at === '岗亭' && insp) {
      story.push('区里来人，王师傅把罐子拿进岗亭搁在桌子底下，下午人走了又搁回原地');
      hidden = true;
    } else if (at === '面包房') {
      if (insp && !bakerKind) {
        story.push('区里来人，面包房的女的嫌门口乱，把罐子收进门后头，下午又搁出来');
        hidden = true;
      } else if (insp && bakerKind) {
        story.push('区里来人问门口这罐子谁的，面包房的女的说"我们店的"');
      } else if (baker === 0 && act !== '不去' && act !== '礼拜天') {
        story.push('面包房的女的开门，拿脚把罐子拨到门边上，靠着墙');
      }
    }
    if (can.at === '站牌' && MELON.has(d) && wk === 0) {
      story.push('卖瓜的把三轮停进站牌的影子里，拿脚把罐子拨到车轱辘后头，太阳底下，水晒干了');
      can.water = 0;
      can.note = '罐子在站牌底下车轱辘后头，干的，晒得烫手。站牌底下一地瓜子。';
    }
    if (can.at === '墙根' && HOT.has(d) && can.water) {
      story.push('墙根没遮挡，下午两点前水晒干了');
      can.water = 0;
      can.note = '罐子在墙根，干的，晒得烫手。';
    }
    if (can.at === '面包房' && bakerKind && !can.water) {
      story.push('中午面包房的女的看罐子空着，拿和面的盆舀了一盆倒进去');
      can.water = 2; flourNew = true;
    }
    if (can.at === '岗亭' && wangKind && !can.water) {
      story.push('中午王师傅出来，把缸子里剩的茶根倒进罐子里');
      can.water = 2; wangN += 1;
    }
    if (wangKind && !wangLooked && can.at !== '岗亭') {
      story.push('中午王师傅端着缸子出来，朝岗亭边上看了一眼，那儿没罐子，他把茶根泼在了树坑里');
      wangLooked = true;
    }
    if (bakerKind && !bakerLooked && can.at !== '面包房') {
      story.push('中午面包房的女的端着盆出来，朝门边上看了一眼，那儿没罐子，她把水泼在了门口');
      bakerLooked = true;
    }
    let dog = '', drank = false;
    if (insp) {
      dog = '没过来（门口站了一排人）';
    } else if (away >= 2) {
      dog = '没来'; away = 1;
    } else if (can.at !== null && can.water && !hidden) {
      const where = can.at;
      dog = `在${where}喝了`;
      drank = true; away = 0; can.water = 0;
      if (where === '面包房') {
        baker += 1;
        if (baker >= 2) dog += '，面包房的女的扔给它一块面包边，它在门口趴了一会儿';
        can.note = '罐子在面包房门边上，见底了，' + (baker >= 2 ? '边上有面包渣。' : '边上一圈湿爪子印。') + (bakerKind ? flour() : '');
      } else if (where === '岗亭') {
        can.note = '罐子在岗亭边上，见底了。' + (wangN ? tea() : '');
      } else if (where === '站牌') {
        can.note = '罐子在站牌底下，见底了，柱子边上一圈湿爪子印。';
      } else {
        can.note = '罐子在墙根，见底了。';
      }
    } else {
      dog = '来了，没喝着';
      away += 1;
      if (can.at === '岗亭' && !hidden) {
        dog += '，在岗亭边上舔空罐子';
        if (!wangKind) {
          wangKind = true; wangN += 1;
          story.push('王师傅在窗户里看着它舔。五点下班前，他把缸子里剩的茶根倒进了罐子');
          can.water = 2;
        }
      } else if (can.at === '面包房' && !hidden) {
        dog += '，在面包房门口舔空罐子';
        if (baker >= 2 && !bakerKind) {
          bakerKind = true; flourNew = true;
          story.push('面包房的女的看见了，"渴成这样"，关门前拿和面的盆舀了一盆倒进罐子');
          can.water = 2;
        } else if (!bakerKind) {
          story.push('面包房的女的拿笤帚把它轰走了，晚上把罐子扔进门口垃圾桶');
          can.at = null; can.water = 0;
        }
      }
    }
    if (can.at === '面包房' && baker === 0 && !drank) {
      story.push('晚上关门，面包房的女的看罐子一天没人动，扔进门口垃圾桶');
      can.at = null; can.water = 0;
    }
    let foot = '';
    if (insp && can.at !== null && !drank) { can.note = ''; foot = '门口地上一片皮鞋印。'; }
    if (can.at !== null && can.water && !drank) {
      can.water -= 1;
      let extra = '';
      if (can.at === '岗亭' && wangN) extra = tea();
      else if (can.at === '面包房' && bakerKind) extra = flourNew ? '水面上浮着一层面粉。' : flour();
      if (can.water) can.note = `罐子在${WHERE[can.at]}，水剩半罐，漂着一片树叶。` + extra + foot;
      else can.note = `罐子在${WHERE[can.at]}，干的。` + extra + foot;
    } else if (can.at !== null && !can.note) {
      can.note = `罐子在${WHERE[can.at]}，干的。`;
    }
    row.can = story; row.dog = dog;
    table.push(row);
    if (d < 6) {
      out.push(`—— ${DAYS[d]} ——`);
      if (act !== '不去') out.push(...lines); else out.push('你没来。');
      continue;
    }
    const sun = table[table.length - 1];
    let end;
    if (sun.dog.startsWith('在面包房')) end = '礼拜天你不在。中午面包房的女的往罐子里添了水，狗喝完在她门口趴着。她管它叫"馒头"。';
    else if (sun.dog.startsWith('在岗亭')) end = '礼拜天你不在。中午王师傅把缸子里剩的茶根倒进罐子里，狗喝了，水面上漂着两片茶叶。';
    else if (sun.dog.startsWith('在')) end = `礼拜天你不在。罐子里还剩着点水，狗${sun.dog}。`;
    else if (sun.dog === '没来') end = '礼拜天你不在。狗没来。';
    else end = '礼拜天你不在。狗下午来了，没喝着，走了。';
    out.push('—— 礼拜天 ——');
    out.push(end);
    out.push('');
    out.push('这一礼拜（你只看得见每天早上那一会儿，下面是一整天）：');
    for (const r of table) {
      const canS = r.can.length ? r.can.join('；') : '没人动';
      out.push(`${r.day}｜你：${r.you}｜罐子：${canS}｜狗：${r.dog}`);
    }
    table = [];
  }
}
if (typeof module !== 'undefined') module.exports = {gzRun, SPOTS, DAYS};
