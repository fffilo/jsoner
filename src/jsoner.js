;(function() {

    "use strict";

    /**
     * JSONer constructor
     *
     * @param  {Mixed} json
     * @return {Void}
     */
    var JSONer = function(json) {
        this._object = json;
    }

    /**
     * JSONer prototype
     *
     * @type {Object}
     */
    JSONer.prototype = {

        /**
         * Get variable type
         *
         * @param  {Mixed}  value
         * @return {String}
         */
        _typeof: function(value) {
            var result = Object.prototype.toString.call(value);
            var match = result.match(/\[object (.+?)\]/);
            if (match)
                result = match[1];

            return result;
        },

        /**
         * Encode HTML
         *
         * @param  {String} value
         * @return {String}
         */
        _encode: function(value) {
            var div = document.createElement('div');
            div.innerText = value;

            return div.innerHTML;
        },

        /**
         * Escape double quotes
         *
         * @param  {String} value
         * @return {String}
         */
        _escape: function(value) {
            return value.replace(/"/g, '\\"');
        },

        /**
         * Parse links and replace with anchor tag
         *
         * @param  {String} value
         * @return {String}
         */
        _linkify: function(value) {
            var preg_replace = function($0, $1, $2, $3, $4) {
                return $1 + '<a href="' + $2 + $3 + $4 + '" target="_blank">' + $2 + $3 + $4 + '</a>';
            };

            return value
                .replace(/(^|\s)(http|https|ftp|irc|smb|file)(:\/\/)(\S+)/g, preg_replace)
                .replace(/(^|\s)(mailto|tel)(:)(\S+)/g, preg_replace);
        },

        /**
         * Replacer method for JSON.stringify
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {Mixed}
         */
        _replacer: function(key, value) {
            return value;
        },

        /**
         * Span template
         *
         * @param  {String} tag
         * @param  {String} content
         * @param  {String} className
         * @param  {String} type
         * @param  {Number} length    (optional)
         * @return {String}
         */
        _template: function(tag, content, className, type, length) {
            return ''
                + '<' + tag
                + ' class="' + className + '"'
                + ' data-type="' + type + '"'
                + (typeof length === 'undefined' ? '' : ' data-length="' + length + '"')
                + '>'
                + content
                + '</' + tag + '>';
        },

        /**
         * Render HTML
         *
         * @param  {String} key
         * @param  {String} value
         * @param  {String} type
         * @param  {Number} length (optional)
         * @return {String}
         */
        _render: function(key, value, type, length) {
            var result = '';
            result += this._template('i', '', 'toggler', type, length);
            result += this._template('strong', key ? '"' + key + '"' : '', 'key', type, length);
            result += this._template('span', key ? ': ' : '', 'separator', type, length);
            result += this._template('div', value, 'value', type, length);

            return result;
        },

        /**
         * Check value type and call format method
         *
         * @param  {String} key
         * @param  {String} value
         * @return {String}
         */
        _format: function(key, value) {
            var type = this._typeof(value);
            if (typeof this['_format' + type] !== 'function')
                throw 'No JSON.toHTML render method for type ' + type + '.';

            return this['_format' + type].call(this, key, value);
        },

        /**
         * Render method for undefined type
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {String}
         */
        _formatUndefined: function(key, value) {
            // pass
        },

        /**
         * Render method for null type
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {String}
         */
        _formatNull: function(key, value) {
            return this._render(key, 'null', 'null');
        },

        /**
         * Render method for boolean type
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {String}
         */
        _formatBoolean: function(key, value) {
            return this._render(key, value.toString(), 'boolean');
        },

        /**
         * Render method for number type
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {String}
         */
        _formatNumber: function(key, value) {
            return this._render(key, value.toString(), 'number');
        },

        /**
         * Render method for string type
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {String}
         */
        _formatString: function(key, value) {
            var result = value;
            result = this._escape(result);
            result = this._encode(result);

            return this._render(key, '"' + this._linkify(result) + '"', 'string');
        },

        /**
         * Render method for function type
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {String}
         */
        _formatFunction: function(key, value) {
            // pass
        },

        /**
         * Render method for date type
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {String}
         */
        _formatDate: function(key, value) {
            return this._render(key, '"' + value.toJSON() + '"', 'date');
        },

        /**
         * Render method for array type
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {String}
         */
        _formatArray: function(key, value) {
            var result = '[<ul data-type="array" data-length="' + value.length + '">';
            for (var i = 0; i < value.length; i++) {
                var render = this._format.call(this, null, value[i]);
                if (!render)
                    continue;

                result += '<li>';
                result += render;
                result += (i < value.length - 1) ? ',' : '';
                result += '</li>';
            }
            result += '</ul>]';

            return this._render(key, result, 'array', value.length);
        },

        /**
         * Render method for object type
         *
         * @param  {String} key
         * @param  {Mixed}  value
         * @return {String}
         */
        _formatObject: function(key, value) {
            var props = Object.keys(value);
            var result = '{<ul data-type="object" data-length="' + props.length + '">';
            for (var i = 0; i < props.length; i++) {
                var render = this._format.call(this, props[i], value[props[i]]);
                if (!render)
                    continue;

                result += '<li>';
                result += render;
                result += (i < props.length - 1) ? ',' : '';
                result += '</li>';
            }
            result += '</ul>}';

            return this._render(key, result, 'object', props.length);
        },

        /**
         * Stringify JSON object
         *
         * @return {String}
         */
        uglify: function() {
            return JSON.stringify(this._object, this._replacer);
        },

        /**
         * Stringify JSON object (pretty print)
         *
         * @return {String}
         */
        prettify: function() {
            return JSON.stringify(this._object, this._replacer, '\t');
        },

        /**
         * Convert JSON object to HTML string
         *
         * @return {String}
         */
        toHTML: function() {
            return ''
                + '<div class="jsoner">'
                + this._format(null, this._object)
                + '</div>';
        },

        /**
         * Create new DOM Element Node with
         * this.toHTML() content
         *
         * @return {Object}
         */
        toElement: function() {
            var result = document.createElement('div');
            result.className = 'jsoner';
            result.innerHTML = this._format(null, this._object);

            return result;
        }

    }

    // bind collapse event
    window.addEventListener('click', function(e) {
        if (e.target.parentElement.querySelector('.jsoner .toggler') === e.target)
            e.target.classList.toggle('collapsed');
    }, false);

    // globalize
    window.JSONer = JSONer;

})();
