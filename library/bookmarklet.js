(function () {
	var u = encodeURIComponent(window.location.href);
	var t = encodeURIComponent(document.title);
	var m = document.getElementsByTagName('meta');
	var y = 'link';
	var d = '';
	var i = false;
	for(var x in m) {if(m[x].name == 'description') {d = m[x].content; break;}}
	for(var x in m)
	{
		if(m[x].getAttribute && m[x].getAttribute('property') == 'og:image')
		{
			i = m[x].content; break;
		}
	}

	if(i) d = '![image]('+i+')  \\n'+d;
	d = encodeURIComponent(d);

	var req = new XMLHttpRequest();
	req.open('GET', document.location, false);
	req.send(null);
	var headers = req.getAllResponseHeaders().toLowerCase();
	var content = headers.match(new RegExp('content-type: image/([\\\\w]+)'));
	if(content && content[1])
	{
		y = 'image';
		t = '';
	}

    f = '<?=window.location.protocol?>//<?=window.location.host?>/bookmark?url='+ u +'&title='+ t +'&text='+ d +'&type='+ y;
	t = function()
	{
		if(!window.open(f, 'turtl', 'location=yes,links=no,scrollbars=no,toolbar=no,width=740,height=525'))
		{
			location.href = f;
		}
    };
    if(/Firefox/.test(navigator.userAgent)) setTimeout(t, 0);
	else t();
})();