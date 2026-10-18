(function(){
  var HOUR = 48;                       // keep equal to --hour in CSS
  var COLORS = ['#60A5FA','#A78BFA','#34D399','#FBBF24','#FB7185'];
  var STORE = 'week-planner-events';
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  var events = load();
  var editingId = null;

  var $ = function(id){ return document.getElementById(id); };
  var pad = function(n){ return String(n).padStart(2,'0'); };

  /* ---------- time helpers ---------- */
  function toMin(t){ var p = t.split(':'); return +p[0]*60 + +p[1]; }
  function toTime(m){ return pad(Math.floor(m/60))+':'+pad(m%60); }
  function fmt(m){                              // 13:30 -> 1:30 PM
    var h = Math.floor(m/60), mm = m%60, ap = h>=12 ? 'PM' : 'AM';
    var formattedHour = (h % 12) ? (h % 12) : 12;
    var formattedMin = mm ? ':' + pad(mm) : '';
    return formattedHour + formattedMin + ' ' + ap;
  }

  /* ---------- storage ---------- */
  function load(){
    try { 
      var data = JSON.parse(localStorage.getItem(STORE));
      if (!data) data = [];
      data.forEach(function(e) {
        if (e.day === undefined && e.date) {
          var d = new Date(e.date);
          e.day = isNaN(d) ? 0 : d.getDay();
          delete e.date;
        }
      });
      return data;
    } catch(e){ return []; }
  }
  function save(){
    try { localStorage.setItem(STORE, JSON.stringify(events)); } catch(e){}
  }

  /* ---------- rendering ---------- */
  function render(){
    var currentDay = new Date().getDay();

    var head = '<div></div>';
    for (var i=0;i<7;i++){
      head += '<div class="cell'+(i===currentDay?' today':'')+'"><div class="dow">'+DAYS[i]+'</div></div>';
    }
    $('head').innerHTML = head;

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
        var col = document.createElement('div');
        col.className = 'day' + (c===currentDay ? ' today' : '');
        col.dataset.day = c;

        col.addEventListener('click', function(e){
          if (e.target !== col && !e.target.classList.contains('now')) return;
          var y = e.clientY - col.getBoundingClientRect().top;
          var start = Math.min(Math.floor(y/HOUR*2)*30, 23*60+30);
          openDialog({day:c, start:start, end:Math.min(start+60,1439)});
        });

        var list = events.filter(function(ev){ return parseInt(ev.day) === c; });
        layout(list).forEach(function(p){
          var ev = p.e, el = document.createElement('button');
          var height = Math.max((ev.end-ev.start)/60*HOUR, 18);
          el.type = 'button';
          el.className = 'ev' + (height < 40 ? ' short' : '');
          el.style.cssText = 'top:'+(ev.start/60*HOUR)+'px;height:'+height+'px;'+
            'left:'+(p.c/p.n*100)+'%;width:'+(100/p.n)+'%;background:'+ev.color;
          el.innerHTML = '<b></b><small>'+fmt(ev.start)+' \u2013 '+fmt(ev.end)+'</small>';
          
          if (ev.title) {
            el.firstChild.textContent = ev.title;
          } else {
            el.firstChild.textContent = '(No title)';
          }

          el.addEventListener('click', function(e){ e.stopPropagation(); openDialog(ev); });
          col.appendChild(el);
        });

        if (c===currentDay){
          var now = document.createElement('div'); now.className = 'now'; now.id = 'now';
          col.appendChild(now);
        }
        body.appendChild(col);
      })(c);
    }
    placeNow();
  }

  function layout(list){
    list = list.slice().sort(function(a,b){ 
      if (a.start !== b.start) {
        return a.start - b.start;
      }
      return b.end - a.end;
    });
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

  /* ---------- Event Dialog & Color Picker ---------- */
  var dlg = $('dlg');

  (function buildSwatches(){
    var wrap = $('swatches');
    
    // Add default color swatches
    COLORS.forEach(function(col,i){
      var l = document.createElement('label');
      l.style.background = col;
      l.innerHTML = '<input type="radio" name="color" value="'+col+'" aria-label="Colour '+(i+1)+'"><span></span>';
      wrap.appendChild(l);
    });

    // Add custom color picker & hex input wrapper
    var customWrap = document.createElement('div');
    customWrap.className = 'custom-color-wrap';
    customWrap.innerHTML = `
      <div class="custom-swatch" id="c-swatch-box" title="Pick a custom color">
        <input type="radio" name="color" id="c-radio" value="#0f766e">
        <span class="swatch-ui" id="c-swatch-ui"></span>
        <input type="color" id="c-picker" value="#0f766e" aria-label="Custom Colour">
      </div>
      <div class="hex-wrap">
        <span class="hash">#</span>
        <input type="text" id="c-hex" placeholder="RRGGBB" maxlength="6" aria-label="Hex Color Code">
      </div>
    `;
    wrap.appendChild(customWrap);

    var radio = $('c-radio'), picker =$('c-picker'), hex = $('c-hex'), swatchUi =$('c-swatch-ui');

    function updateCustomUi(colorVal) {
      radio.value = colorVal;
      picker.value = colorVal;
      swatchUi.style.background = colorVal;
    }

    // Color picker input event
    picker.addEventListener('input', function(){
      radio.checked = true;
      updateCustomUi(this.value);
      hex.value = this.value.substring(1).toUpperCase();
    });

    // Clicking custom swatch triggers color picker dialog
    $('c-swatch-box').addEventListener('click', function(e){
      radio.checked = true;
      if (e.target !== picker) {
        if (picker.showPicker) {
          picker.showPicker();
        } else {
          picker.click();
        }
      }
    });

    // Sync from Hex code text field
    hex.addEventListener('input', function(){
      var val = this.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6).toUpperCase();
      this.value = val;
      
      if (val.length === 6) {
        var validHex = '#' + val;
        radio.checked = true;
        updateCustomUi(validHex);
      } else if (val.length === 3) {
        var validHex3 = '#' + val[0]+val[0]+val[1]+val[1]+val[2]+val[2];
        radio.checked = true;
        updateCustomUi(validHex3);
      }
    });
  })();

  function openDialog(ev){
    if (ev.id) {
      editingId = ev.id;
    } else {
      editingId = null;
    }

    $('dlgTitle').textContent = editingId ? 'Edit event' : 'New event';
    
    if (ev.title) {
      $('f-title').value = ev.title;
    } else {
      $('f-title').value = '';
    }

    if (ev.day !== undefined) {
      $('f-day').value = ev.day;
    } else {
      $('f-day').value = new Date().getDay();
    }

    $('f-start').value = toTime(ev.start);$('f-end').value = toTime(ev.end);
    
    var color = ev.color;
    if (!color) {
      color = COLORS[0];
    }

    var isCustom = !COLORS.includes(color);

    if (isCustom) {
      $('c-radio').value = color;
      $('c-picker').value = color;
      $('c-swatch-ui').style.background = color;
      $('c-hex').value = color.substring(1).toUpperCase();$('c-radio').checked = true;
    } else {
      document.querySelectorAll('#swatches input[type="radio"]').forEach(function(r){ 
        if (r.value === color) r.checked = true; 
      });
      $('c-swatch-ui').style.background = 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)';$('c-hex').value = ''; 
    }

    $('del').style.display = editingId ? '' : 'none';
    $('err').textContent = '';
    dlg.showModal();
    $('f-title').focus();
  }

  $('form').addEventListener('submit', function(e){
    e.preventDefault();
    var start = toMin($('f-start').value), end = toMin($('f-end').value);
    if (end <= start){ $('err').textContent = 'End time must be after the start time.'; return; }
    
    var chosen = document.querySelector('#swatches input:checked');
    var selectedColor = COLORS[0];
    if (chosen) {
      selectedColor = chosen.value;
    }

    var data = {
      title: $('f-title').value.trim(),
      day: parseInt($('f-day').value),
      start: start, 
      end: end,
      color: selectedColor
    };
    
    if (editingId){
      events = events.map(function(ev){ 
        if (ev.id === editingId) {
          return Object.assign({id:editingId}, data);
        }
        return ev; 
      });
    } else {
      data.id = 'e' + Date.now() + Math.random().toString(36).slice(2,6);
      events.push(data);
    }
    
    save(); 
    dlg.close(); render();
  });

  $('cancel').addEventListener('click', function(){ dlg.close(); });$('del').addEventListener('click', function(){
    events = events.filter(function(ev){ return ev.id !== editingId; });
    save(); 
    dlg.close(); render();
  });

  dlg.addEventListener('click', function(e){
    if (e.target === dlg) dlg.close();
  });

  /* ---------- Actions ---------- */
  $('add').addEventListener('click', function(){
    var now = new Date(), start = Math.min((now.getHours()+1)*60, 22*60);
    openDialog({day:now.getDay(), start:start, end:start+60});
  });

  $('download').addEventListener('click', function() {
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    var a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "routine-planner.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  $('import').addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(evt) {
      try {
        var parsed = JSON.parse(evt.target.result);
        if (Array.isArray(parsed)) {
          parsed.forEach(function(ev) {
            if (ev.day === undefined && ev.date) {
              var d = new Date(ev.date);
              ev.day = isNaN(d) ? 0 : d.getDay();
              delete ev.date;
            }
          });
          events = parsed;
          save(); 
          render();
        } else {
          alert('Invalid file format: Expected a JSON array.');
        }
      } catch (err) {
        alert('Error parsing JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  });

  var resetDlg = $('resetDlg');
  
  $('reset').addEventListener('click', function() { resetDlg.showModal(); });$('resetCancel').addEventListener('click', function() { resetDlg.close(); });

  $('resetForm').addEventListener('submit', function(e) {
    e.preventDefault();
    events = [];
    save(); 
    render();
    resetDlg.close();
  });

  resetDlg.addEventListener('click', function(e){
    if (e.target === resetDlg) resetDlg.close();
  });

  
  /* ---------- go ---------- */
  render();
  $('scroller').scrollTop = 7*HOUR - 8;          
  setInterval(placeNow, 60000);
})();