define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",


], function(declare, _WidgetBase, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent) {
    "use strict";

    return declare("MarketoForm.widget.MarketoForm", [_WidgetBase], {


        // Internal variables.
        _handles: null,
        _contextObj: null,
        // modeler
        mktoFormId: null,
        mktoKey: null,
        mfName: null,
        options: null,


        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            // 1. identify the parent node for the injection
            this.domNode.setAttribute('id', 'mktoForm_' + this.mktoFormId);
            // 2. call the code
            this._loadMarketoScript(lang.hitch(this, function() {
                this._loadMarketoForm(this.mktoFormId, this.mktoKey);
            }));
        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        _loadMarketoScript: function(callback) {
            var script;
            if (typeof callback !== 'function') {
                throw new Error('Not a valid callback');
            }
            script = document.createElement('script');
            script.onload = callback;
            script.src = '//app-sjn.marketo.com/js/forms2/js/forms2.min.js'; //mkto url
            document.head.appendChild(script);
        },

        _loadMarketoForm: function(mktoFormId, mktoKey) {
            MktoForms2.loadForm("//app-sjn.marketo.com", mktoKey, mktoFormId, lang.hitch(this, function(form) {
                // call the mf onsubmit
                form.onSuccess(lang.hitch(this, function() {
                    mx.data.action({
                        params: {
                            actionname: this.mfName,
                            applyto: "selection",
                            guids: [this._contextObj.getGuid()]
                        }
                    });
                }));
                // try {
                //     var optionsObject = JSON.parse(this.options);
                //     form.vals(optionsObject);
                // } catch (e) {
                //     console.error('MKTO FORM WIDGET >>> there was an error parsing the following string: \n' + this.options);
                //     console.error(e);
                // }
                var res = {};
                this.options.forEach(function(o) {
                    res[o.fName] = this._contextObj.get(o.fValue);
                }, this);
                // console.log(res);
                form.vals(res);

            }));
        },

        _updateRendering: function(callback) {
            logger.debug(this.id + "._updateRendering");

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback);
        },

        _executeCallback: function(cb) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["MarketoForm/widget/MarketoForm"]);