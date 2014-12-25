;
var URLSearchParams = (function () {
    function URLSearchParams(init) {
        this.list = [];
        this.urlObject = [];
        if (typeof init === "string") {
            this.list = this.parse(init);
        }
        if (typeof init === "object") {
            this.list = init.list;
        }
    }
    URLSearchParams.prototype.append = function (name, value) {
        this.list.push({ name: name, value: value });
        this.update();
    };
    URLSearchParams.prototype.delete = function (name) {
        this.list = this.list.filter(function (pair) {
            return pair.name !== name;
        });
        this.update();
    };
    URLSearchParams.prototype.get = function (name) {
        return this.getAll(name).shift() || null;
    };
    URLSearchParams.prototype.getAll = function (name) {
        return this.list.reduce(function (acc, pair) {
            if (pair.name === name) {
                acc.push(pair.value);
            }
            return acc;
        }, []);
    };
    URLSearchParams.prototype.has = function (name) {
        return this.list.some(function (pair) {
            return pair.name === name;
        });
    };
    URLSearchParams.prototype.set = function (name, value) {
        // if exists, this appended will remove in filter.
        this.list.push({ name: name, value: value });
        // update all pair
        this.list.map(function (pair) {
            if (pair.name === name) {
                pair.value = value;
            }
            return pair;
        }).filter(function (pair) {
            if (pair.name === name) {
                if (this.emitted) {
                    // current pair is duplicate
                    return false;
                }
                else {
                    // first pair of key
                    this.emitted = true;
                    return true;
                }
            }
            // other pair
            return true;
        }, { emitted: false });
    };
    URLSearchParams.prototype.byteSerialize = function (input) {
        input = encodeURIComponent(input);
        // revert space to '+'
        input = input.replace("%20", "+");
        // replace chars which encodeURIComponent dosen't cover
        input = input.replace("!", "%21").replace("~", "%7E").replace("'", "%27").replace("(", "%28").replace(")", "%29");
        return input;
    };
    URLSearchParams.prototype.serialize = function (pairs, encodingOverride) {
        if (encodingOverride === undefined) {
            encodingOverride = "utf-8";
        }
        var output = pairs.reduce(function (_output, pair, index) {
            // use encodeURIComponent as byte serializer
            var name = encodeURIComponent(pair.name);
            var value = encodeURIComponent(pair.value);
            if (index !== 0) {
                _output = _output + "&";
            }
            _output += name + "=" + value;
            return _output;
        }, "");
        return output;
    };
    // https://url.spec.whatwg.org/#concept-urlencoded-parser
    /**
     * CAUTION
     * this implementation currently support only UTF-8 encoding
     * so ignore 'encodingOverride' and '_charset_' flag
     */
    URLSearchParams.prototype.parse = function (input, encodingOverride, useCharset, isIndex) {
        if (encodingOverride === undefined) {
            encodingOverride = "utf-8";
        }
        if (encodingOverride !== "utf-8") {
            throw new Error("unsupported eocnding");
        }
        var sequences = input.split('&');
        if (isIndex) {
            var head = sequences[0];
            if (head.indexOf("=") === -1) {
                sequences[0] = "=" + head;
            }
        }
        var pairs = sequences.map(function (bytes) {
            if (bytes === "")
                return;
            // Split in "="
            var name, value;
            if (bytes.indexOf("=")) {
                var b = bytes.split("=");
                name = b.shift();
                value = b.join("=");
            }
            else {
                name = bytes;
                value = "";
            }
            // replace "+" to 0x20
            var c0x20 = String.fromCharCode(0x20);
            name.replace(/\+/g, c0x20);
            value.replace(/\+/g, c0x20);
            if (useCharset && name === "_charset_") {
                throw new Error("unsupported flug _charset_");
            }
            // parsent decode
            name = decodeURIComponent(name);
            value = decodeURIComponent(value);
            return { name: name, value: value };
        });
        return null;
    };
    URLSearchParams.prototype.update = function () {
    };
    URLSearchParams.prototype.toString = function () {
        return "";
    };
    return URLSearchParams;
})();