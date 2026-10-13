(function(){
  var d=document,r=d.documentElement;r.classList.add("js");
  var mb=d.getElementById("menu"),nv=d.getElementById("nav");
  if(mb)mb.addEventListener("click",function(){mb.setAttribute("aria-expanded",nv.classList.toggle("open"))});
  var cp=d.getElementById("copy"),st=d.getElementById("status");
  if(cp)cp.addEventListener("click",function(){
    var m=d.getElementById("mail").textContent.trim();
    function say(t){st.textContent=t;setTimeout(function(){st.textContent=""},2500)}
    if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(m).then(function(){say("Email copied")},function(){say("Copy failed. Select the email instead.")});
    else say("Copy is not available here. Select the email instead.");
  });

  /* Chrome object: home page only. One WebGL scene, CSS fallback if unavailable. */
  var c=d.getElementById("gl");if(!c)return;
  function fail(){r.classList.add("nogl")}
  var still=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gl=c.getContext("webgl",{alpha:true,premultipliedAlpha:true,antialias:false});
  if(!gl)return fail();
  var fs=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;uniform float t;uniform vec2 m;
float map(vec3 p){
  float d=length(p)-1.0;
  d+=.14*sin(p.x*2.6+t*.5)*sin(p.y*2.9-t*.4)*sin(p.z*2.4+t*.35);
  d+=.04*sin(p.x*7.+t*.7)*sin(p.z*6.-t*.6);
  return d*.75;
}
vec3 env(vec3 d){
  float a=atan(d.z,d.x);
  vec3 c=mix(vec3(.01),vec3(.30),smoothstep(-.2,1.,d.y));
  c+=2.4*smoothstep(.16,.0,abs(d.y-.38))*smoothstep(1.3,.3,abs(a-1.0));
  c+=1.5*smoothstep(.3,.0,abs(a+1.9))*smoothstep(.9,.0,abs(d.y+.05));
  c+=.9*smoothstep(.14,.0,abs(d.y+.45))*smoothstep(1.4,.4,abs(a-2.6));
  c*=mix(.25,1.,smoothstep(-.6,.1,d.y));
  return c;
}
void main(){
  vec2 uv=(gl_FragCoord.xy*2.-r)/min(r.x,r.y);
  vec3 ro=vec3(0.,0.,3.8),rd=normalize(vec3(uv,-2.4));
  float ay=(m.x-.5)*1.1,ax=(m.y-.5)*.6;
  mat2 ry=mat2(cos(ay),-sin(ay),sin(ay),cos(ay));
  mat2 rx=mat2(cos(ax),-sin(ax),sin(ax),cos(ax));
  ro.xz=ry*ro.xz;rd.xz=ry*rd.xz;ro.yz=rx*ro.yz;rd.yz=rx*rd.yz;
  float s=0.;bool hit=false;
  for(int i=0;i<60;i++){float h=map(ro+rd*s);if(h<.002){hit=true;break;}s+=h;if(s>8.)break;}
  if(!hit){gl_FragColor=vec4(0.);return;}
  vec3 p=ro+rd*s;vec2 e=vec2(.004,0.);
  vec3 n=normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
  float f=pow(1.+dot(rd,n),3.);
  vec3 col=env(reflect(rd,n))*(.8+.5*f);
  gl_FragColor=vec4(col,1.);
}`;
  function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return gl.getShaderParameter(o,gl.COMPILE_STATUS)?o:null}
  var v=sh(gl.VERTEX_SHADER,"attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}"),f=sh(gl.FRAGMENT_SHADER,fs);
  if(!v||!f)return fail();
  var pr=gl.createProgram();gl.attachShader(pr,v);gl.attachShader(pr,f);gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return fail();
  gl.useProgram(pr);gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  var a=gl.getAttribLocation(pr,"a");gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  var ur=gl.getUniformLocation(pr,"r"),ut=gl.getUniformLocation(pr,"t"),um=gl.getUniformLocation(pr,"m");
  var tx=.5,ty=.5,sx=.5,sy=.5,moved=false,vis=true;
  function size(){var k=Math.min(devicePixelRatio||1,1.5);c.width=Math.round(c.clientWidth*k);c.height=Math.round(c.clientHeight*k);gl.viewport(0,0,c.width,c.height)}
  function draw(now){
    if(!moved&&!still){tx=.5+.2*Math.sin(now/4200);ty=.5+.1*Math.cos(now/5300)} /* gentle drift without a cursor */
    sx+=(tx-sx)*.05;sy+=(ty-sy)*.05;
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(ur,c.width,c.height);gl.uniform1f(ut,now/1000);gl.uniform2f(um,sx,sy);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }
  size();
  if(still){draw(5000);addEventListener("resize",function(){size();draw(5000)});return}
  addEventListener("resize",size);
  addEventListener("pointermove",function(e){if(e.pointerType==="touch")return;moved=true;tx=e.clientX/innerWidth;ty=1-e.clientY/innerHeight},{passive:true});
  if("IntersectionObserver" in window)new IntersectionObserver(function(e){vis=e[0].isIntersecting}).observe(c);
  (function loop(now){if(vis&&!d.hidden)draw(now);requestAnimationFrame(loop)})(0);
})();
