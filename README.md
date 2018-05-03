# creative-creator
Flow &amp; Form builder by GUI. This is extend of 'dobtco Formbuilder'.
# Demo
[Click here](https://creative-creator.github.io/) .
# Basics
```
<div id='Ccreator'></div>

<script>
window.route = 'flow/form'
var Ccreator = new Ccreator({ selector: '#Ccreator' });
</script>
```
or
```
Ccreator = new Ccreator({
      selector: '.fb-main',         //  Set main element as C-creator.
      bootstrapData: Data,          // To set Array structure all fields on here.
      cconnect: connector ,         //  To set Flow creator line Array.
      pathStroke: '#5bc0de',        //  To set Flow creator line color.
      pathOrientation: 'auto',      // To set Flow creator line [horizontal|vertical|auto (default)]. 
      pathOffset: 0,                // To set Flow creator line offset. 
      arrowHead: '#55ded2',         // On flow creator line head color would change from here.
      // type: "flow",              // To set Flow or Form (Its already maintain by window.route).
      mode:'edit',                  // Mode is two types 1)view 2)edit.
      beforeunload:true             // Beforeunload set for leave from page.
      });
```
## Know for more...

[Click here](https://mnjroy.bitbucket.io/) .


#### `save`
```
var ccreator = new Ccreator({ selector: '.cc-main' });

ccreator.on('save', function(payload){
  ...
});
```



## Developing
You'll need [node and npm](http://nodejs.org/) installed.

1. `npm install` or `sudo npm install`
2. `bower install` or `sudo bower install --allow-root`
3. `grunt watch`
