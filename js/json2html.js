var json2html = function(tree_selector, table_selector, items) {
    var tree_element = jQuery(tree_selector);
    var table_element = jQuery(table_selector);

    var purge = function(string) { return string.replace(/\W+/g,'-').replace(/^\-+|\-+$/g, ''); };
    var isSimpleArray = function(obj) {
        if(!(obj instanceof Array)) return false;
        for(var k=0; k<obj.lenght; k++)
            if(!(obj[k] instanceof Number || obj[k] instanceof String))
                return false;
        return true;
    }
    var encode = function(html) {
        return jQuery('<div/>').text(html).html()
    };
    var find_keys = function(obj,path,d) {
        path = path || 'root';
        d = d || {};
        if(obj instanceof Object) {
            for(var key in obj) {
                var new_path = path+'.' + purge(key);
                find_keys(obj[key],new_path,d);
            }   
        } else if(obj instanceof Array && !isSimpleArray(obj)) {
            for(var k=0; k<obj.length; k++) {
                var new_path = path+'.' + k;
                find_keys(obj[k],new_path,d);
            }
        } else if(obj instanceof Number) {
            d[path] = ''+obj;
        } else if(obj instanceof String) {
            d[path] = encode(obj);
        } else if(obj == null || obj == undefined) {
            d[path] = ''+obj;
        } else {
            d[path] = encode(obj);
        }
        return d;
    };
    var make_tree = function(keys) {
        tree = {root:[]};
        keys.sort()
        for(var i=0; i<keys.length; i++) {
            var key =  keys[i];
            parts = key.split('.');
            prev = 'root';
            for(var k=1; k<parts.length; k++) {
                path = parts.slice(1,k+1).join('.');
                if(!(path in tree)) {
                    tree[prev].push(path);
                    tree[path] = [];
                }
                prev = path;
            }
        }
        return tree;
    };        
    var tree2ul = function(tree, root, k, style) {
        root = root || 'root';
        k = k || 0;
        style = style || '';
        var ul = '<ul style="'+style+'">';
        for(var i=0; i<tree[root].length; i++) {
            var item = tree[root][i];
            var toggable = tree[item];
            var attributes = '';
            if(toggable.length>0) {
                attributes += ' class="toggable" data-folder="'+encode(item)+'"';
                input = ' <i class="glyphicon glyphicon-folder-open"></i>';
            } else {
                input = ' <input data-key="root-'+item+'" type="checkbox"/>';
            }           
            var span = '<span'+attributes+'>'+item.split('.').slice(k).join('.')+'</span>';
            var li = '<li>'+span+input+tree2ul(tree,item,k+1,style=(toggable?"display:none":''));
            ul += li;
        }
        ul += '</ul>';
        return ul;
    };
    var main = function() {
        var keys = [], data = [];
        for(var k=0; k<items.length; k++) {
            var item_keys = find_keys(items[k]);
            data.push(item_keys);
            for(var key in item_keys)
                if(keys.indexOf(key)<0)
                    keys.push(key);
        }
        keys.sort();
        var menu = tree2ul(make_tree(keys));
        tree_element.html(menu);
        var head = '<tr><td></td>';
        for(var k=0; k<keys.length; k++)
            head += '<th class="keycol '+keys[k].replace(/\./g,'-')+'" style="display:none">'+keys[k]+'</th>';
        head += '</tr>';
        var body = '';
        for(var i=0; i<data.length; i++) {
            body += '<tr><th>'+name+'</th>';
            for(var k=0; k<keys.length; k++) {
                body+='<td class="keycol '+keys[k].replace(/\./g,'-')+'" style="display:none">'+data[i][keys[k]]+'</td>';
            }
            body += '</tr>';
        }
        var table = '<table class="table"><thead>'+head+'</thead><tbody>'+body+'</tbody></table';
        table_element.html(table);
        jQuery('.keycol').hide();
        var open_folders = localStorage.getItem('open_folders');
        open_folders = {}; //open_folders?eval('('+open_folders+')'):{};
        jQuery('.toggable').each(function(){
                var self = jQuery(this);
                var name = self.data('folder');
                var ul = self.parent().find('ul');
                self.click(function(event){
                        event.preventDefault();
                        open_folders[name] = !ul.is(':visible');
                        localStorage.setItem('open_folders',JSON.stringify(open_folders));
                        ul.slideToggle();
                    });
                if(open_folders[name]) ul.show(); else ul.hide();
            });
        jQuery('input[type=checkbox]').each(function(){
                jQuery(this).click(function(event){
                        var self = jQuery(this);
                        var key = self.attr('data-key').replace(/\./g,'-');
                        if(self.is(':checked')) jQuery('.'+key).show(); else jQuery('.'+key).hide();
                    });
            });
    };
    main();
    return; 
};
