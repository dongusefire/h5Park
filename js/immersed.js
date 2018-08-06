(function(w){
	var immersed = 0;
	var ms=(/Html5Plus\/.+\s\(.*(Immersed\/(\d+\.?\d*).*)\)/gi).exec(navigator.userAgent);
	if(ms&&ms.length>=3){
		immersed=parseFloat(ms[2]);
	}
	w.immersed=immersed;
	
	if(!immersed){
		return;
	};
	var h = document.getElementById('immersed-header');
	if(h){
		h.style.paddingTop = immersed+'px';
	};
	var Map = document.getElementById('map');
	if(Map){
		Map.style.top = Number(immersed)+'px';
	};
	var c = document.getElementById('immersed-content');
	if(c){
		c.style.top = (Number(immersed)+46)+'px';
	};
	var ph = document.getElementById('park-header');
	if(ph && immersed>20){
		ph.style.paddingTop = (immersed-20)+'px';
	};
	var pn = document.getElementById('park-nav');
	if(pn && immersed>20){
		pn.style.top = ((immersed-20)+145)+'px';
	};
	var hc = document.getElementById('immersed-homeContent');
	if(hc){
		hc.style.top = immersed+'px';
	};
})(window);