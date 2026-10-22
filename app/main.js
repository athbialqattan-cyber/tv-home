(function(){
  var APPS=[
    {name:'يوتيوب',re:/youtube/i,id:'111299001912'},
    {name:'نتفليكس',re:/netflix/i,id:'11101200001'},
    {name:'شاهد',re:/shahid/i,id:''},
    {name:'ديزني+',re:/disney/i,id:'3201901017640'}
  ];
  var status=document.getElementById('status');
  function log(m){status.textContent=m;}
  function pad(n){return n<10?'0'+n:''+n;}
  function tick(){
    var d=new Date();
    document.getElementById('clock').textContent=pad(d.getHours())+':'+pad(d.getMinutes());
    document.getElementById('date').textContent=d.toDateString();
  }
  tick();setInterval(tick,15000);

  var installed=[];
  try{
    tizen.application.getAppsInfo(function(list){installed=list;build();},function(e){log('getAppsInfo error: '+(e&&e.message));build();});
  }catch(e){log('no tizen api: '+e);build();}

  var focusIdx=0,tiles=[];
  function build(){
    var shelf=document.getElementById('shelf');shelf.innerHTML='';tiles=[];
    APPS.forEach(function(a){
      var info=null;
      installed.forEach(function(i){if(!info&&a.re.test(i.name))info=i;});
      var id=info?info.id:a.id;
      var el=document.createElement('div');el.className='app';
      if(info&&info.iconPath){var im=document.createElement('img');im.src=info.iconPath;el.appendChild(im);}
      var t=document.createElement('div');t.textContent=a.name;el.appendChild(t);
      el.onclick=function(){launch(id,a.name);};
      shelf.appendChild(el);tiles.push({el:el,id:id,name:a.name});
    });
    setFocus(0);
    log('apps: '+installed.length+' | tizen: '+(typeof tizen)+' | ids: '+tiles.map(function(t){return t.name+'='+t.id;}).join(' , '));
  }
  function setFocus(i){
    if(!tiles.length)return;
    focusIdx=(i+tiles.length)%tiles.length;
    tiles.forEach(function(t,n){t.el.className='app'+(n===focusIdx?' focus':'');});
  }
  function launch(id,name){
    if(!id){log('no id for '+name);return;}
    try{tizen.application.launch(id,function(){},function(e){log('launch failed: '+e.message);});}
    catch(e){log('launch error: '+e);}
  }
  document.addEventListener('keydown',function(e){
    // RTL shelf: first tile is on the right, so Left moves to the next tile
    if(e.keyCode===37)setFocus(focusIdx+1);
    else if(e.keyCode===39)setFocus(focusIdx-1);
    else if(e.keyCode===13&&tiles[focusIdx])launch(tiles[focusIdx].id,tiles[focusIdx].name);
  });

  // prayer times, Kuwait City, Umm al-Qura (method 4)
  fetch('https://api.aladhan.com/v1/timings?latitude=29.3759&longitude=47.9774&method=4')
    .then(function(r){return r.json();}).then(function(j){
      var t=j.data.timings;
      document.getElementById('prayer').innerHTML='الفجر '+t.Fajr+'<br>الظهر '+t.Dhuhr+'<br>العصر '+t.Asr+'<br>المغرب '+t.Maghrib+'<br>العشاء '+t.Isha;
    }).catch(function(e){document.getElementById('prayer').textContent='';log('prayer error: '+(e&&e.message||e));});
})();
