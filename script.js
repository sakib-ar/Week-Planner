(function(){
  var HOUR = 48;                       // keep equal to --hour in CSS
  var COLORS = ['#0f766e','#4f46e5','#b45309','#be123c','#475569'];
  var STORE = 'week-planner-events';
  var DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  var weekStart = startOfWeek(new Date());
  var events = load();
  var editingId = null;

  var $ = function(id){ return document.getElementById(id); };
  var pad = function(n){ return String(n).padStart(2,'0'); };

  /* ---------- date + time helpers ---------- */
  function startOfWeek(d){                     // week begins on Sunday
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() - x.getDay());
    return x;
  }
  function addDays(d,n){ var x = new Date(d); x.setDate(x.getDate()+n); return x; }
  function key(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function toMin(t){ var p = t.split(':'); return +p[0]*60 + +p[1]; }
  function toTime(m){ return pad(Math.floor(m/60))+':'+pad(m%60); }
  function fmt(m){                              // 13:30 -> 1:30 PM
    var h = Math.floor(m/60), mm = m%60, ap = h>=12 ? 'PM' : 'AM';
    return ((h%12)||12) + (mm ? ':'+pad(mm) : '') + ' ' + ap;
  }

  /* ---------- storage (safe if unavailable) ---------- */
  function load(){
    try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch(e){ return []; }
  }
  function save(){
    try { localStorage.setItem(STORE, JSON.stringify(events)); } catch(e){}
  }

  /* ---------- rendering ---------- */
  function render(){
    var todayKey = key(new Date());
    var end = addDays(weekStart,6);
    var sameMonth = weekStart.getMonth() === end.getMonth();
    $('range').textContent =
      weekStart.toLocaleDateString(undefined,{month:'short',day:'numeric'}) + ' \u2013 ' +
      end.toLocaleDateString(undefined, sameMonth ? {day:'numeric',year:'numeric'} : {month:'short',day:'numeric',year:'numeric'});

    // header row
    var head = '<div></div>';
    for (var i=0;i<7;i++){
      var d = addDays(weekStart,i);
      head += '<div class="cell'+(key(d)===todayKey?' today':'')+'"><div class="dow">'+DAYS[i]+'</div><div class="num">'+d.getDate()+'</div></div>';
    }
    $('head').innerHTML = head;

    // body: gutter + 7 day columns
    var body = $('body'); body.innerHTML = '';
    var g = document.createElement('div'); g.className = 'gutter';
    for (var h=1; h<24; h++){
      var s = document.createElement('span');
      s.style.top = (h*HOUR)+'px';
      s.textContent = fmt(h*60);
      g.appendChild(s);
    }
    body.appendChild(g);

    for (var c=0;c<7;c++){
      (function(c){
        var date = addDays(weekStart,c), k = key(date);
        var col = document.createElement('div');
        col.className = 'day' + (k===todayKey ? ' today' : '');
        col.dataset.date = k;

        // click empty space -> create (snaps to 30 min)
        col.addEventListener('click', function(e){
          if (e.target !== col && !e.target.classList.contains('now')) return;
          var y = e.clientY - col.getBoundingClientRect().top;
          var start = Math.min(Math.floor(y/HOUR*2)*30, 23*60+30);
          openDialog({date:k, start:start, end:Math.min(start+60,1439)});
        });

        var list = events.filter(function(ev){ return ev.date===k; });
        layout(list).forEach(function(p){
          var ev = p.e, el = document.createElement('button');
          var height = Math.max((ev.end-ev.start)/60*HOUR, 18);
          el.type = 'button';
          el.className = 'ev' + (height < 40 ? ' short' : '');
          el.style.cssText = 'top:'+(ev.start/60*HOUR)+'px;height:'+height+'px;'+
            'left:'+(p.c/p.n*100)+'%;width:'+(100/p.n)+'%;background:'+ev.color;
          el.innerHTML = '<b></b><small>'+fmt(ev.start)+' \u2013 '+fmt(ev.end)+'</small>';
          el.firstChild.textContent = ev.title || '(No title)';
          el.addEventListener('click', function(e){ e.stopPropagation(); openDialog(ev); });
          col.appendChild(el);
        });

        if (k===todayKey){
          var now = document.createElement('div'); now.className = 'now'; now.id = 'now';
          col.appendChild(now);
        }
        body.appendChild(col);
      })(c);
    }
    placeNow();
  }

  // Side-by-side columns for overlapping events
  function layout(list){
    list = list.slice().sort(function(a,b){ return a.start-b.start || b.end-a.end; });
    var out = [], cluster = [], clusterEnd = 0;
    function flush(){
      var cols = [];
      cluster.forEach(function(e){
        var i = cols.findIndex(function(endAt){ return endAt <= e.start; });
        if (i < 0){ i = cols.length; cols.push(0); }
        cols[i] = e.end;
        out.push({e:e, c:i, cluster:cluster});
      });
      var n = cols.length;
      out.forEach(function(p){ if (p.cluster === cluster) p.n = n; });
      cluster = []; clusterEnd = 0;
    }
    list.forEach(function(e){
      if (cluster.length && e.start >= clusterEnd) flush();
      cluster.push(e); clusterEnd = Math.max(clusterEnd, e.end);
    });
    if (cluster.length) flush();
    return out;
  }

  function placeNow(){
    var n = $('now'); if (!n) return;
    var d = new Date();
    n.style.top = ((d.getHours()*60 + d.getMinutes())/60*HOUR) + 'px';
  }

  /* ---------- dialog ---------- */
  var dlg = $('dlg');

  (function buildSwatches(){
    var wrap = $('swatches');
    COLORS.forEach(function(col,i){
      var l = document.createElement('label');
      l.style.background = col;
      l.innerHTML = '<input type="radio" name="color" value="'+col+'" aria-label="Colour '+(i+1)+'"><span></span>';
      wrap.appendChild(l);
    });
  })();

  function openDialog(ev){
    editingId = ev.id || null;
    $('dlgTitle').textContent = editingId ? 'Edit event' : 'New event';
    $('f-title').value = ev.title || '';
    $('f-date').value  = ev.date;
    $('f-start').value = toTime(ev.start);
    $('f-end').value   = toTime(ev.end);
    var color = ev.color || COLORS[0];
    document.querySelectorAll('#swatches input').forEach(function(r){ r.checked = r.value === color; });
    $('del').style.display = editingId ? '' : 'none';
    $('err').textContent = '';
    dlg.showModal();
    $('f-title').focus();
  }

  $('form').addEventListener('submit', function(e){
    e.preventDefault();
    var start = toMin($('f-start').value), end = toMin($('f-end').value);
    if (!$('f-date').value){ $('err').textContent = 'Choose a date.'; return; }
    if (end <= start){ $('err').textContent = 'End time must be after the start time.'; return; }
    var chosen = document.querySelector('#swatches input:checked');
    var data = {
      title: $('f-title').value.trim(),
      date: $('f-date').value,
      start: start, end: end,
      color: chosen ? chosen.value : COLORS[0]
    };
    if (editingId){
      events = events.map(function(ev){ return ev.id === editingId ? Object.assign({id:editingId}, data) : ev; });
    } else {
      data.id = 'e' + Date.now() + Math.random().toString(36).slice(2,6);
      events.push(data);
    }
    save();
    // jump to the week that holds the saved event
    var p = $('f-date').value.split('-');
    weekStart = startOfWeek(new Date(+p[0], +p[1]-1, +p[2]));
    dlg.close(); render();
  });

  $('cancel').addEventListener('click', function(){ dlg.close(); });
  $('del').addEventListener('click', function(){
    events = events.filter(function(ev){ return ev.id !== editingId; });
    save(); dlg.close(); render();
  });

  /* ---------- navigation ---------- */
  $('prev').addEventListener('click', function(){ weekStart = addDays(weekStart,-7); render(); });
  $('next').addEventListener('click', function(){ weekStart = addDays(weekStart,7);  render(); });
  $('today').addEventListener('click', function(){ weekStart = startOfWeek(new Date()); render(); });
  $('add').addEventListener('click', function(){
    var now = new Date(), start = Math.min((now.getHours()+1)*60, 22*60);
    openDialog({date:key(now), start:start, end:start+60});
  });

  /* ---------- go ---------- */
  render();
  $('scroller').scrollTop = 7*HOUR - 8;          // open around 7 AM
  setInterval(placeNow, 60000);
})();