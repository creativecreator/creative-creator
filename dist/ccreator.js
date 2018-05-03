(function() {
  rivets.binders.input = {
    publishes: true,
    routine: rivets.binders.value.routine,
    bind: function(el) {
      return $(el).bind('input.rivets', this.publish);
    },
    unbind: function(el) {
      return $(el).unbind('input.rivets');
    }
  };

  rivets.configure({
    prefix: "rv",
    adapter: {
      subscribe: function(obj, keypath, callback) {
        callback.wrapped = function(m, v) {
          return callback(v);
        };
        return obj.on('change:' + keypath, callback.wrapped);
      },
      unsubscribe: function(obj, keypath, callback) {
        return obj.off('change:' + keypath, callback.wrapped);
      },
      read: function(obj, keypath) {
        if (keypath === "cid") {
          return obj.cid;
        }
        return obj.get(keypath);
      },
      publish: function(obj, keypath, value) {
        if (obj.cid) {
          return obj.set(keypath, value);
        } else {
          return obj[keypath] = value;
        }
      }
    }
  });

}).call(this);

(function() {
  var BuilderView, Ccreator, CreativeCollection, CreativeModel, EditFieldView, ViewFieldView, _ref, _ref1, _ref2, _ref3, _ref4,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  CreativeModel = (function(_super) {
    __extends(CreativeModel, _super);

    function CreativeModel() {
      _ref = CreativeModel.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    CreativeModel.prototype.sync = function() {};

    CreativeModel.prototype.indexInDOM = function() {
      var $wrapper,
        _this = this;
      $wrapper = $(".fb-field-wrapper").filter((function(_, el) {
        return $(el).data('cid') === _this.cid;
      }));
      return $(".fb-field-wrapper").index($wrapper);
    };

    CreativeModel.prototype.is_input = function() {
      return Ccreator.inputFields[this.get(Ccreator.options.mappings.FIELD_TYPE)] != null;
    };

    return CreativeModel;

  })(Backbone.DeepModel);

  CreativeCollection = (function(_super) {
    __extends(CreativeCollection, _super);

    function CreativeCollection() {
      _ref1 = CreativeCollection.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    CreativeCollection.prototype.initialize = function() {
      return this.on('add', this.copyCidToModel);
    };

    CreativeCollection.prototype.model = CreativeModel;

    CreativeCollection.prototype.comparator = function(model) {
      return model.indexInDOM();
    };

    CreativeCollection.prototype.copyCidToModel = function(model) {
      return model.attributes.cid = model.cid;
    };

    return CreativeCollection;

  })(Backbone.Collection);

  ViewFieldView = (function(_super) {
    __extends(ViewFieldView, _super);

    function ViewFieldView() {
      _ref2 = ViewFieldView.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    ViewFieldView.prototype.className = "fb-field-wrapper ";

    ViewFieldView.prototype.events = {
      'click .subtemplate-wrapper': 'focusEditView',
      'click .js-duplicate': 'duplicate',
      'click .js-clear': 'clear'
    };

    ViewFieldView.prototype.initialize = function(options) {
      var that,
        _this = this;
      this.parentView = options.parentView;
      that = this;
      this.listenTo(this.model, "change", this.render);
      this.listenTo(this.model, "destroy", this.remove);
      this.$el.addClass('node-' + this.model.get('cid'));
      if (this.parentView.mode !== 'view') {
        this.$el.draggable({
          disabled: false,
          cursor: "move",
          containment: "parent",
          snap: true,
          drag: function(i, val) {},
          stop: function(event, ui) {
            var pos;
            pos = ui.position;
            _this.model.set(Ccreator.options.size.LEFT, pos.left);
            return _this.model.set(Ccreator.options.size.TOP, pos.top);
          }
        });
      }
    };

    ViewFieldView.prototype.render = function() {
      this.$el.addClass('response-field-' + this.model.get(Ccreator.options.mappings.FIELD_TYPE)).css({
        'left': this.model.get(Ccreator.options.size.LEFT),
        'top': this.model.get(Ccreator.options.size.TOP),
        'width': this.model.get(Ccreator.options.mappings.WIDTH),
        'height': this.model.get(Ccreator.options.mappings.HEIGHT),
        'box-shadow': '0px 0px ' + this.model.get(Ccreator.options.mappings.LIGHT_SLIDER) + 'px #fff, #fff 0px 0px ' + this.model.get(Ccreator.options.mappings.LIGHT_SLIDER) + 'px inset'
      }).data('cid', this.model.cid).html(Ccreator.templates["view/base" + (!this.model.is_input() ? '_non_input' : '')]({
        rf: this.model
      }));
      return this;
    };

    ViewFieldView.prototype.focusEditView = function() {
      if (this.parentView.mode !== 'view') {
        return this.parentView.createAndShowEditView(this.model);
      }
    };

    ViewFieldView.prototype.clear = function(e) {
      var cb, filtered, filteredLast, x,
        _this = this;
      e.stopPropagation();
      e.preventDefault();
      cb = function() {
        _this.parentView.handleFormUpdate();
        return _this.model.destroy();
      };
      x = Ccreator.options.CLEAR_FIELD_CONFIRM;
      switch (typeof x) {
        case 'string':
          if (confirm(x)) {
            cb();
          }
          break;
        case 'function':
          x(cb);
          break;
        default:
          cb();
      }
      filtered = _.filter(this.parentView.cconnect, function(item) {
        return item.start !== '.node-' + _this.model.attributes.cid;
      });
      filteredLast = _.filter(filtered, function(item) {
        return item.end !== '.node-' + _this.model.attributes.cid;
      });
      this.parentView.cconnectArr = filteredLast;
      return this.parentView.connectLine(this.parentView.pathStroke, this.parentView.pathOrientation, this.parentView.pathOffset, this.parentView.cconnectArr, this.parentView.arrowHead);
    };

    ViewFieldView.prototype.duplicate = function() {
      var attrs;
      attrs = _.clone(this.model.attributes);
      delete attrs['id'];
      attrs['label'] += ' Copy';
      return this.parentView.createField(attrs, {
        position: this.model.indexInDOM() + 1
      });
    };

    return ViewFieldView;

  })(Backbone.View);

  EditFieldView = (function(_super) {
    __extends(EditFieldView, _super);

    function EditFieldView() {
      _ref3 = EditFieldView.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    EditFieldView.prototype.className = "edit-response-field";

    EditFieldView.prototype.events = {
      'click .js-add-option': 'addOption',
      'click .js-remove-option': 'removeOption',
      'click .js-default-updated': 'defaultUpdated',
      'input .option-label-input': 'forceRender'
    };

    EditFieldView.prototype.initialize = function(options) {
      this.parentView = options.parentView;
      return this.listenTo(this.model, "destroy", this.remove);
    };

    EditFieldView.prototype.render = function() {
      this.$el.html(Ccreator.templates["edit/base" + (!this.model.is_input() ? '_non_input' : '')]({
        rf: this.model
      }));
      rivets.bind(this.$el, {
        model: this.model
      });
      return this;
    };

    EditFieldView.prototype.remove = function() {
      this.parentView.editView = void 0;
      this.parentView.$el.find("[data-target=\"#addField\"]").click();
      return EditFieldView.__super__.remove.apply(this, arguments);
    };

    EditFieldView.prototype.addOption = function(e) {
      var $el, i, newOption, options;
      $el = $(e.currentTarget);
      i = this.$el.find('.option').index($el.closest('.option'));
      options = this.model.get(Ccreator.options.mappings.OPTIONS) || [];
      newOption = {
        label: "",
        checked: false
      };
      if (i > -1) {
        options.splice(i + 1, 0, newOption);
      } else {
        options.push(newOption);
      }
      this.model.set(Ccreator.options.mappings.OPTIONS, options);
      this.model.trigger("change:" + Ccreator.options.mappings.OPTIONS);
      return this.forceRender();
    };

    EditFieldView.prototype.removeOption = function(e) {
      var $el, index, options;
      $el = $(e.currentTarget);
      index = this.$el.find(".js-remove-option").index($el);
      options = this.model.get(Ccreator.options.mappings.OPTIONS);
      options.splice(index, 1);
      this.model.set(Ccreator.options.mappings.OPTIONS, options);
      this.model.trigger("change:" + Ccreator.options.mappings.OPTIONS);
      return this.forceRender();
    };

    EditFieldView.prototype.defaultUpdated = function(e) {
      var $el;
      $el = $(e.currentTarget);
      if (this.model.get(Ccreator.options.mappings.FIELD_TYPE) !== 'checkboxes') {
        this.$el.find(".js-default-updated").not($el).attr('checked', false).trigger('change');
      }
      return this.forceRender();
    };

    EditFieldView.prototype.forceRender = function() {
      return this.model.trigger('change');
    };

    EditFieldView.prototype.run = function(e) {
      var $el, i, resizeIt, __this,
        _this = this;
      $el = $(e.currentTarget);
      i = this.$el.find('.fb-field-wrapper');
      __this = this;
      resizeIt = function(_this) {
        return $(_this).resizable({
          handles: 's,e,n,w',
          cursor: 'move',
          disabled: false,
          animate: false,
          instance: false,
          start: function(event, ui) {},
          stop: function(event, ui) {
            __this.model.set(Ccreator.options.mappings.WIDTH, ui.size.width);
            __this.model.set(Ccreator.options.mappings.HEIGHT, ui.size.height);
            return __this.forceRender();
          }
        });
      };
      if ($($el).is('.ui-resizable')) {
        $($el).resizable('destroy');
        return resizeIt($el);
      } else {
        return resizeIt($el);
      }
    };

    return EditFieldView;

  })(Backbone.View);

  BuilderView = (function(_super) {
    __extends(BuilderView, _super);

    function BuilderView() {
      _ref4 = BuilderView.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    BuilderView.prototype.SUBVIEWS = [];

    BuilderView.prototype.events = {
      'click .fb-field-wrapper': 'nodeOnFocus',
      'click .form': 'saveForm',
      'click .fb-tabs a': 'showTab',
      'click .fb-add-field-types a': 'addField',
      'click .position-save': 'dragLine',
      'focusout .position-save': 'removeActiveClass',
      'click svg': 'removeActiveClass',
      'mouseover .fb-add-field-types': 'lockLeftWrapper',
      'mouseout .fb-add-field-types': 'unlockLeftWrapper',
      'click .theme-img': 'themeImage',
      'click path': 'removeRedPath'
    };

    BuilderView.prototype.initialize = function(options) {
      var selector;
      selector = options.selector, this.ccreator = options.ccreator, this.bootstrapData = options.bootstrapData, this.background = options.background, this.builderType = options.builderType, this.cconnect = options.cconnect, this.pathStroke = options.pathStroke, this.pathOrientation = options.pathOrientation, this.pathOffset = options.pathOffset, this.arrowHead = options.arrowHead, this.mode = options.mode, this.beforeunload = options.beforeunload;
      this.cconnectArr = [];
      if (selector != null) {
        this.setElement($(selector));
      }
      this.collection = new CreativeCollection;
      this.collection.bind('add', this.addOne, this);
      this.collection.bind('reset', this.reset, this);
      this.collection.bind('change', this.handleFormUpdate, this);
      this.collection.bind('destroy add reset', this.hideShowNoResponseFields, this);
      this.getResponseData();
      this.render();
      this.collection.reset(this.bootstrapData);
      this.bindSaveEvent();
      return this.triggerRoute();
    };

    BuilderView.prototype.triggerRoute = function() {
      $('[data-field-type]').css('display', 'none');
      $('.' + this.builderType).css('display', 'block');
      switch (this.builderType) {
        case 'form':
          $('.position-save').remove();
          $('.fb-main').css('background-color', '#fff');
          $('.fb-right').addClass('form-node-color');
          $(".theme").remove();
          $("#dialog").remove();
          break;
        case 'flow':
          this.connectLine(this.pathStroke, this.pathOrientation, this.pathOffset, this.cconnect, this.arrowHead);
          $('.fb-main').css('background-color', '#000');
          $('.fb-right').removeClass('form-node-color');
          $(".theme").remove();
          $('.player-modal').trigger("click");
          $("#dialog").dialog({
            modal: true,
            width: 600
          });
          break;
        default:
          $('.position-save').remove();
          $('.fb-main').css('background-color', '#fff');
          $('.fb-right').addClass('form-node-color');
          $(".theme").remove();
          return $("#dialog").remove();
      }
    };

    BuilderView.prototype.nodeOnFocus = function(e) {
      var $el, endPoint, startP, startPoint, target, thisIndxInc;
      $el = $(e.currentTarget);
      target = this.$el.find('.fb-field-wrapper');
      if (this.mode !== 'view') {
        thisIndxInc = this.editView.model.get('cid');
        startP = $('.storeArray').val();
        $('.getUIindex').val(thisIndxInc);
        if (route !== 'flow') {
          this.editView.run(e);
        }
        if (target.hasClass('pulse-button')) {
          target.addClass('cyan lighten-3');
          if (startP === "") {
            this.removeDuplicatePath(this.cconnect);
          } else if (startP !== "" && $('.getUIindex').val() !== startP) {
            if (target.hasClass('cyan lighten-3')) {
              endPoint = '.node-' + thisIndxInc;
              startPoint = '.node-' + startP;
              this.cconnectObj = {
                'end': endPoint,
                'start': startPoint
              };
            }
          }
          $('.storeArray').val(thisIndxInc);
          this.cconnectArr.push(this.cconnectObj);
          delete this.cconnectObj;
          this.cconnect = _.without(this.cconnectArr, _.findWhere(this.cconnectArr, {}));
          this.connectLine(this.pathStroke, this.pathOrientation, this.pathOffset, this.cconnect, this.arrowHead);
        }
        return this.handleFormUpdate();
      }
    };

    BuilderView.prototype.highlightPath = function() {
      return setInterval(function() {
        return $("path").hover(function(e) {
          return $(this).attr({
            "stroke-width": 8
          });
        }, function() {
          return $(this).attr({
            "stroke-width": 5
          });
        });
      });
    };

    BuilderView.prototype.removeRedPath = function(e) {
      var $el;
      e.stopPropagation();
      $el = $(e.currentTarget);
      if (this.mode !== 'view') {
        $('path').attr({
          "stroke": '#5bc0de'
        });
        return $($el).attr({
          "stroke": 'red'
        });
      }
    };

    BuilderView.prototype.pathRemoveDelete = function(e) {
      var __this;
      __this = this;
      return $(document).keyup(function(e) {
        var path, pathRed;
        if (e.keyCode === 46) {
          path = $('path');
          pathRed = document.body.querySelector('path[stroke=red]');
          if (pathRed) {
            return $(path).each(function(i, v) {
              if (v === pathRed) {
                pathRed.remove();
                __this.cconnect.splice(i, 1);
                __this.cconnectArr = __this.cconnect;
                return __this.handleFormUpdate();
              }
            });
          }
        }
      });
    };

    BuilderView.prototype.removeActiveClass = function(e) {
      var $el, target;
      $el = $(e.currentTarget);
      target = this.$el.find('.fb-field-wrapper');
      $(target).removeClass('pulse-button');
      $('.storeArray').val('');
      return this.removeDuplicatePath(this.cconnect);
    };

    BuilderView.prototype.removeDuplicatePath = function(cconnect) {
      var convrtObj, uniqPath;
      uniqPath = _.uniq(_.collect(cconnect, function(x) {
        return JSON.stringify(x);
      }));
      convrtObj = _.map(uniqPath, function(num) {
        return JSON.parse(num);
      });
      this.cconnect = convrtObj;
      return this.connectLine(this.pathStroke, this.pathOrientation, this.pathOffset, this.cconnect, this.arrowHead);
    };

    BuilderView.prototype.dragLine = function(e) {
      var $el, target;
      $el = $(e.currentTarget);
      target = this.$el.find('.fb-field-wrapper');
      return $(target).addClass('pulse-button');
    };

    BuilderView.prototype.bindSaveEvent = function() {
      var _this = this;
      this.formSaved = true;
      this.saveFormButton = this.$el.find(".js-save-form");
      this.saveFormButton.attr('disabled', true).css('width', '0%');
      if (!!Ccreator.options.AUTOSAVE) {
        setInterval(function() {
          _this.saveForm.call(_this);
          return $("svg:last-child").siblings('svg').remove();
        }, 400);
      }
      if (this.beforeunload === false) {
        return $(window).bind('beforeunload', function() {
          if (_this.formSaved) {
            return void 0;
          } else {
            return Ccreator.options.dict.UNSAVED_CHANGES;
          }
        });
      }
    };

    BuilderView.prototype.connectLine = function(pathStroke, pathOrientation, pathOffset, cconnect, arrowHead) {
      this.pathStroke = pathStroke;
      this.pathOrientation = pathOrientation;
      this.pathOffset = pathOffset;
      this.cconnect = cconnect;
      this.arrowHead = arrowHead;
      return $(".fb-response-fields").CCconnect({
        stroke: this.pathStroke,
        orientation: this.pathOrientation,
        offset: this.pathOffset,
        paths: this.cconnect,
        arrowHead: this.arrowHead
      });
    };

    BuilderView.prototype.reset = function() {
      this.$responseFields.html('');
      return this.addAll();
    };

    BuilderView.prototype.render = function() {
      var subview, _i, _len, _ref5;
      this.$el.html(Ccreator.templates['page']());
      this.$fbLeft = this.$el.find('.fb-left');
      this.$responseFields = this.$el.find('.fb-response-fields');
      this.$fbLeft.attr({
        'link': 'flow'
      });
      this.hideShowNoResponseFields();
      this.highlightPath();
      this.pathRemoveDelete();
      _ref5 = this.SUBVIEWS;
      for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
        subview = _ref5[_i];
        new subview({
          parentView: this
        }).render();
      }
      return this;
    };

    BuilderView.prototype.bindWindowScrollEvent = function() {
      var _this = this;
      return $(window).on('scroll', function() {
        var maxMargin, newMargin;
        if (_this.$fbLeft.data('locked') === true) {
          return;
        }
        newMargin = Math.max(0, $(window).scrollTop() - _this.$el.offset().top);
        maxMargin = _this.$responseFields.height();
        return _this.$fbLeft.css({
          'margin-top': Math.min(maxMargin, newMargin)
        });
      });
    };

    BuilderView.prototype.showTab = function(e) {
      var $el, first_model, target;
      $el = $(e.currentTarget);
      target = $el.data('target');
      $el.closest('li').addClass('active').siblings('li').removeClass('active');
      $(target).addClass('active').siblings('.fb-tab-pane').removeClass('active');
      if (target !== '#editField') {
        this.unlockLeftWrapper();
      }
      if (target === '#editField' && !this.editView && (first_model = this.collection.models[0])) {
        return this.createAndShowEditView(first_model);
      }
    };

    BuilderView.prototype.addOne = function(responseField, _, options) {
      var $replacePosition, view;
      view = new ViewFieldView({
        model: responseField,
        parentView: this
      });
      if (options.$replaceEl != null) {
        return options.$replaceEl.replaceWith(view.render().el);
      } else if ((options.position == null) || options.position === -1) {
        return this.$responseFields.append(view.render().el);
      } else if (options.position === 0) {
        return this.$responseFields.prepend(view.render().el);
      } else if (($replacePosition = this.$responseFields.find(".fb-field-wrapper").eq(options.position))[0]) {
        return $replacePosition.before(view.render().el);
      } else {
        return this.$responseFields.append(view.render().el);
      }
    };

    BuilderView.prototype.setDroppable = function() {
      var _this = this;
      this.$responseFields.droppable({
        greedy: true,
        placeholder: 'sortable-placeholder',
        drop: function(e, ui) {
          var getRecent, lft, pos, rf, rightContain, tp;
          if (ui.draggable.data('field-type')) {
            rf = _this.collection.create(Ccreator.helpers.defaultFieldAttrs(ui.draggable.data('field-type')), {
              $replaceEl: ui.item
            });
            _this.createAndShowEditView(rf);
            pos = ui.position;
            rightContain = document.querySelector('.fb-right');
            getRecent = _this.$el.find('.fb-field-wrapper.editing');
            lft = pos.left - $(rightContain).offset().left;
            tp = pos.top - $(rightContain).offset().top;
            $(getRecent).css({
              'left': lft,
              'top': tp
            });
            _this.editView.model.set(Ccreator.options.size.LEFT, lft);
            _this.editView.model.set(Ccreator.options.size.TOP, tp);
            _this.getTopLeft(parseInt(pos.left), parseInt(pos.top));
          }
          _this.handleFormUpdate();
          return true;
        },
        update: function(e, ui) {}
      });
      return this.setDraggable();
    };

    BuilderView.prototype.getTopLeft = function(left, top) {
      var leftSide, lft, link, rightSideLeft, topLeft;
      link = $(".fb-left").attr('link');
      rightSideLeft = $(".fb-right").position().left;
      leftSide = $(".fb-left." + link).width();
      lft = leftSide += rightSideLeft;
      return topLeft = {
        'left': left - 200,
        'top': top
      };
    };

    BuilderView.prototype.setDraggable = function() {
      var $addFieldButtons,
        _this = this;
      $addFieldButtons = this.$el.find("[data-field-type]");
      return $addFieldButtons.draggable({
        connectToSortable: this.$responseFields,
        stop: function(e, ui) {
          var cc;
          return cc = ui.helper.position();
        },
        helper: function() {
          var $helper;
          $helper = $("<div class='response-field-draggable-helper' />");
          $helper.css({
            width: '80px',
            height: '80px',
            'z-index': 99
          });
          return $helper;
        }
      });
    };

    BuilderView.prototype.addAll = function() {
      this.collection.each(this.addOne, this);
      return this.setDroppable();
    };

    BuilderView.prototype.hideShowNoResponseFields = function() {
      return this.$el.find(".fb-no-response-fields")[this.collection.length > 0 ? 'hide' : 'show']();
    };

    BuilderView.prototype.addField = function(e) {
      var field_type;
      field_type = $(e.currentTarget).data('field-type');
      return this.createField(Ccreator.helpers.defaultFieldAttrs(field_type));
    };

    BuilderView.prototype.createField = function(attrs, options) {
      var rf;
      rf = this.collection.create(attrs, options);
      this.createAndShowEditView(rf);
      return this.handleFormUpdate();
    };

    BuilderView.prototype.createAndShowEditView = function(model) {
      var $newEditEl, $responseFieldEl;
      $responseFieldEl = this.$el.find(".fb-field-wrapper").filter(function() {
        return $(this).data('cid') === model.cid;
      });
      $responseFieldEl.addClass('editing').siblings('.fb-field-wrapper').removeClass('editing');
      if (this.editView) {
        if (this.editView.model.cid === model.cid) {
          this.$el.find(".fb-tabs a[data-target=\"#editField\"]").click();
          return;
        }
        this.editView.remove();
      }
      this.editView = new EditFieldView({
        model: model,
        parentView: this
      });
      $newEditEl = this.editView.render().$el;
      this.$el.find(".fb-edit-field-wrapper").html($newEditEl);
      this.$el.find(".fb-tabs a[data-target=\"#editField\"]").click();
      return this;
    };

    BuilderView.prototype.parentBackgroundImage = function(getImgSrc) {
      if (this.background === "" && $(".right-section")[0].style.backgroundImage === "") {
        return this.background = 'vendor/img/' + Ccreator.themeResource[0];
      } else {
        return $(".right-section").attr("style", "background:url('" + this.background + "')");
      }
    };

    BuilderView.prototype.themeImage = function(e) {
      var $el, getImgSrc, target;
      $el = $(e.currentTarget);
      target = $el.find('.theme-img');
      getImgSrc = target.prevObject.attr('src');
      this.background = getImgSrc;
      return this.parentBackgroundImage(this.background);
    };

    BuilderView.prototype.ensureEditViewScrolled = function() {
      if (!this.editView) {

      }
    };

    BuilderView.prototype.scrollLeftWrapper = function($responseFieldEl) {
      var _this = this;
      this.unlockLeftWrapper();
      if (!$responseFieldEl[0]) {
        return;
      }
      return $.scrollWindowTo((this.$el.offset().top + $responseFieldEl.offset().top) - this.$responseFields.offset().top, 200, function() {
        return _this.lockLeftWrapper();
      });
    };

    BuilderView.prototype.lockLeftWrapper = function() {
      return this.$fbLeft.data('locked', true);
    };

    BuilderView.prototype.unlockLeftWrapper = function() {
      return this.$fbLeft.data('locked', false);
    };

    BuilderView.prototype.handleFormUpdate = function() {
      if (this.updatingBatch) {
        return;
      }
      this.formSaved = false;
      return this.saveFormButton.removeAttr('disabled').css('width', '100%');
    };

    BuilderView.prototype.saveForm = function(e) {
      var payload;
      if (this.formSaved) {
        return;
      }
      this.formSaved = true;
      this.fields = {};
      this.saveFormButton.attr('disabled', true).css('width', '0%');
      this.collection.sort();
      this.fields[this.builderType] = JSON.stringify(this.collection.toJSON());
      payload = this.fields;
      if (Ccreator.options.HTTP_ENDPOINT) {
        this.doAjaxSave(payload);
      }
      return this.ccreator.trigger('save', {
        'fields': payload,
        'connector': this.cconnect,
        'backImage': this.background,
        'type': this.builderType
      });
    };

    BuilderView.prototype.getResponseData = function() {
      switch (route) {
        case 'form':
          return this.builderType = 'form';
        case 'flow':
          return this.builderType = 'flow';
      }
    };

    BuilderView.prototype.doAjaxSave = function(payload) {
      var _this = this;
      return $.ajax({
        url: Ccreator.options.HTTP_ENDPOINT,
        type: Ccreator.options.HTTP_METHOD,
        data: payload,
        contentType: "application/json",
        success: function(data) {
          var datum, _i, _len, _ref5;
          _this.updatingBatch = true;
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            datum = data[_i];
            if ((_ref5 = _this.collection.get(datum.cid)) != null) {
              _ref5.set({
                id: datum.id
              });
            }
            _this.collection.trigger('sync');
          }
          return _this.updatingBatch = void 0;
        }
      });
    };

    return BuilderView;

  })(Backbone.View);

  Ccreator = (function() {
    Ccreator.helpers = {
      defaultFieldAttrs: function(field_type) {
        var attrs, _base;
        attrs = {};
        attrs[Ccreator.options.mappings.LABEL] = 'Untitled';
        attrs[Ccreator.options.mappings.FIELD_TYPE] = field_type;
        attrs[Ccreator.options.mappings.LIGHT_SLIDER] = 5;
        attrs['field_options'] = {};
        return (typeof (_base = Ccreator.fields[field_type]).defaultAttributes === "function" ? _base.defaultAttributes(attrs) : void 0) || attrs;
      },
      simple_format: function(x) {
        return x != null ? x.replace(/\n/g, '<br />') : void 0;
      }
    };

    Ccreator.options = {
      BUTTON_CLASS: 'fb-button',
      HTTP_ENDPOINT: '',
      HTTP_METHOD: 'POST',
      AUTOSAVE: true,
      CLEAR_FIELD_CONFIRM: false,
      mappings: {
        SIZE: 'field_options.size',
        UNITS: 'field_options.units',
        LABEL: 'label',
        FIELD_TYPE: 'field_type',
        REQUIRED: 'required',
        CHECKED: 'checked',
        ADMIN_ONLY: 'admin_only',
        OPTIONS: 'field_options.options',
        DESCRIPTION: 'field_options.description',
        INCLUDE_OTHER: 'field_options.include_other_option',
        INCLUDE_BLANK: 'field_options.include_blank_option',
        INTEGER_ONLY: 'field_options.integer_only',
        MIN: 'field_options.min',
        MAX: 'field_options.max',
        MINLENGTH: 'field_options.minlength',
        MAXLENGTH: 'field_options.maxlength',
        LENGTH_UNITS: 'field_options.min_max_length_units',
        WIDTH: 'field_options.resize.width',
        HEIGHT: 'field_options.resize.height',
        LIGHT_SLIDER: 'field_options.light_slider',
        THERMAL_SLIDER: 'field_options.thermal_slider'
      },
      theme: {
        IMAGE: 'imgSet'
      },
      dict: {
        ALL_CHANGES_SAVED: 'All changes saved',
        SAVE_FORM: 'Save form',
        UNSAVED_CHANGES: 'You have unsaved changes. If you leave this page, you will lose those changes!'
      },
      size: {
        LEFT: 'design.left',
        TOP: 'design.top'
      }
    };

    Ccreator.fields = {};

    Ccreator.inputFields = {};

    Ccreator.nonInputFields = {};

    Ccreator.registerField = function(name, opts) {
      var x, _i, _len, _ref5;
      _ref5 = ['view', 'edit'];
      for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
        x = _ref5[_i];
        opts[x] = _.template(opts[x]);
      }
      opts.field_type = name;
      Ccreator.fields[name] = opts;
      if (opts.type === 'non_input') {
        return Ccreator.nonInputFields[name] = opts;
      } else {
        return Ccreator.inputFields[name] = opts;
      }
    };

    function Ccreator(opts) {
      var args;
      if (opts == null) {
        opts = {};
      }
      _.extend(this, Backbone.Events);
      args = _.extend(opts, {
        ccreator: this
      });
      this.mainView = new BuilderView(args);
    }

    return Ccreator;

  })();

  window.Ccreator = Ccreator;

}).call(this);

(function() {
  Ccreator.registerField('address', {
    order: 50,
    view: "<div class='input-line'>\n  <span class='street'>\n    <input type='text' />\n    <label>Address</label>\n  </span>\n</div>\n\n<div class='input-line'>\n  <span class='city'>\n    <input type='text' />\n    <label>City</label>\n  </span>\n\n  <span class='state'>\n    <input type='text' />\n    <label>State / Province / Region</label>\n  </span>\n</div>\n\n<div class='input-line'>\n  <span class='zip'>\n    <input type='text' />\n    <label>Zipcode</label>\n  </span>\n\n  <span class='country'>\n    <select><option>United States</option></select>\n    <label>Country</label>\n  </span>\n</div>",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-home\"></span></span> Address",
    identity: "form"
  });

}).call(this);

(function() {
  Ccreator.registerField('checkboxes', {
    order: 10,
    view: "<% for (i in (rf.get(Ccreator.options.mappings.OPTIONS) || [])) { %>\n  <div>\n    <label class='fb-option'>\n      <input type='checkbox' <%= rf.get(Ccreator.options.mappings.OPTIONS)[i].checked && 'checked' %> onclick=\"javascript: return false;\" />\n      <%= rf.get(Ccreator.options.mappings.OPTIONS)[i].label %>\n    </label>\n  </div>\n<% } %>\n\n<% if (rf.get(Ccreator.options.mappings.INCLUDE_OTHER)) { %>\n  <div class='other-option'>\n    <label class='fb-option'>\n      <input type='checkbox' />\n      Other\n    </label>\n\n    <input type='text' />\n  </div>\n<% } %>",
    edit: "<%= Ccreator.templates['edit/options']({ includeOther: true }) %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-square-o\"></span></span> Checkboxes",
    identity: "form",
    defaultAttributes: function(attrs) {
      attrs.field_options.options = [
        {
          label: "",
          checked: false
        }, {
          label: "",
          checked: false
        }
      ];
      return attrs;
    }
  });

}).call(this);

(function() {
  Ccreator.registerField('control', {
    order: 0,
    view: "<span class='fa fa-cogs font-xxx-large'></span>",
    edit: "",
    addButton: "<span class='symbol'><span class='fa fa-cogs'></span></span> Control",
    identity: "flow",
    defaultAttributes: function(attrs) {
      attrs.field_options.size = 'small';
      attrs.label = 'Control Room';
      return attrs;
    }
  });

}).call(this);

(function() {
  Ccreator.registerField('date', {
    order: 20,
    view: "<div class='input-line'>\n  <span class='month'>\n    <input type=\"text\" />\n    <label>MM</label>\n  </span>\n\n  <span class='above-line'>/</span>\n\n  <span class='day'>\n    <input type=\"text\" />\n    <label>DD</label>\n  </span>\n\n  <span class='above-line'>/</span>\n\n  <span class='year'>\n    <input type=\"text\" />\n    <label>YYYY</label>\n  </span>\n</div>",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-calendar\"></span></span> Date",
    identity: "form"
  });

}).call(this);

(function() {
  Ccreator.registerField('dropdown', {
    order: 24,
    view: "<select>\n  <% if (rf.get(Ccreator.options.mappings.INCLUDE_BLANK)) { %>\n    <option value=''></option>\n  <% } %>\n\n  <% for (i in (rf.get(Ccreator.options.mappings.OPTIONS) || [])) { %>\n    <option <%= rf.get(Ccreator.options.mappings.OPTIONS)[i].checked && 'selected' %>>\n      <%= rf.get(Ccreator.options.mappings.OPTIONS)[i].label %>\n    </option>\n  <% } %>\n</select>",
    edit: "<%= Ccreator.templates['edit/options']({ includeBlank: true }) %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-caret-down\"></span></span> Dropdown",
    identity: "form",
    defaultAttributes: function(attrs) {
      attrs.field_options.options = [
        {
          label: "",
          checked: false
        }, {
          label: "",
          checked: false
        }
      ];
      attrs.field_options.include_blank_option = false;
      return attrs;
    }
  });

}).call(this);

(function() {
  Ccreator.registerField('email', {
    order: 40,
    view: "<input type='text' class='rf-size-<%= rf.get(Ccreator.options.mappings.SIZE) %>' />",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-envelope-o\"></span></span> Email",
    identity: "form"
  });

}).call(this);

(function() {


}).call(this);

(function() {
  Ccreator.registerField('light', {
    order: 50,
    view: "<i class=\"fa fa-lightbulb-o symbol\" aria-hidden=\"true\"></i>",
    edit: "<%= Ccreator.templates['edit/light_slider']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-lightbulb-o \"></span></span> Light",
    identity: "interior"
  });

}).call(this);

(function() {
  Ccreator.registerField('number', {
    order: 30,
    view: "<input type='text' />\n<% if (units = rf.get(Ccreator.options.mappings.UNITS)) { %>\n  <%= units %>\n<% } %>",
    edit: "<%= Ccreator.templates['edit/min_max']() %>\n<%= Ccreator.templates['edit/units']() %>\n<%= Ccreator.templates['edit/integer_only']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-number\">123</span></span> Number",
    identity: "form"
  });

}).call(this);

(function() {
  Ccreator.registerField('paragraph', {
    order: 5,
    view: "<textarea class='rf-size-<%= rf.get(Ccreator.options.mappings.SIZE) %>'></textarea>",
    edit: "<%= Ccreator.templates['edit/size']() %>\n<%= Ccreator.templates['edit/min_max_length']() %>",
    addButton: "<span class=\"symbol\">&#182;</span> Paragraph",
    identity: "form",
    defaultAttributes: function(attrs) {
      attrs.field_options.size = 'small';
      return attrs;
    }
  });

}).call(this);

(function() {
  Ccreator.registerField('price', {
    order: 45,
    view: "<div class='input-line'>\n  <span class='above-line'>$</span>\n  <span class='dolars'>\n    <input type='text' />\n    <label>Dollars</label>\n  </span>\n  <span class='above-line'>.</span>\n  <span class='cents'>\n    <input type='text' />\n    <label>Cents</label>\n  </span>\n</div>",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-usd\"></span></span> Price",
    identity: "form"
  });

}).call(this);

(function() {
  Ccreator.registerField('radio', {
    order: 15,
    view: "<% for (i in (rf.get(Ccreator.options.mappings.OPTIONS) || [])) { %>\n  <div>\n    <label class='fb-option'>\n      <input type='radio' <%= rf.get(Ccreator.options.mappings.OPTIONS)[i].checked && 'checked' %> onclick=\"javascript: return false;\" />\n      <%= rf.get(Ccreator.options.mappings.OPTIONS)[i].label %>\n    </label>\n  </div>\n<% } %>\n\n<% if (rf.get(Ccreator.options.mappings.INCLUDE_OTHER)) { %>\n  <div class='other-option'>\n    <label class='fb-option'>\n      <input type='radio' />\n      Other\n    </label>\n\n    <input type='text' />\n  </div>\n<% } %>",
    edit: "<%= Ccreator.templates['edit/options']({ includeOther: true }) %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-circle-o\"></span></span> Multiple Choice",
    identity: "form",
    defaultAttributes: function(attrs) {
      attrs.field_options.options = [
        {
          label: "",
          checked: false
        }, {
          label: "",
          checked: false
        }
      ];
      return attrs;
    }
  });

}).call(this);

(function() {
  Ccreator.registerField('system', {
    order: 30,
    view: "<i class=\"fa fa-laptop font-xxx-large\" aria-hidden=\"true\"></i>\n<i class=\"fa fa-mail-forward\" style=\"position:absolute;top:0;right:2px;z-index:9;\" onclick=\"location.href=\'form.html\'\" aria-hidden=\"true\"></i>",
    edit: "<%= Ccreator.templates['edit/integer_only']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-laptop\"></span></span> System ",
    identity: "flow",
    defaultAttributes: function(attrs) {
      attrs.label = 'System';
      return attrs;
    }
  });

}).call(this);

(function() {
  Ccreator.registerField('text', {
    order: 0,
    view: "<input type='text' class='rf-size-<%= rf.get(Ccreator.options.mappings.SIZE) %>' />",
    edit: "<%= Ccreator.templates['edit/size']() %>\n<%= Ccreator.templates['edit/min_max_length']() %>",
    addButton: "<span class='symbol'><span class='fa fa-font'></span></span> Text",
    identity: "form",
    defaultAttributes: function(attrs) {
      attrs.field_options.size = 'small';
      return attrs;
    }
  });

}).call(this);

(function() {
  Ccreator.registerField('thermometer', {
    order: 50,
    view: "<i class=\"fa fa-thermometer-half symbol\" aria-hidden=\"true\"></i>\n<h5 class=\"bold\">\n  <%= rf.get(Ccreator.options.mappings.THERMAL_SLIDER) %> %\n</h5>",
    edit: "<%= Ccreator.templates['edit/thermal_slider']() %>",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-thermometer-half\"></span></span> Thermometer",
    identity: "interior",
    defaultAttributes: function(attrs) {
      console.log(attrs.field_options.resize);
      return attrs;
    }
  });

}).call(this);

(function() {
  Ccreator.registerField('time', {
    order: 25,
    view: "<div class='input-line'>\n  <span class='hours'>\n    <input type=\"text\" />\n    <label>HH</label>\n  </span>\n\n  <span class='above-line'>:</span>\n\n  <span class='minutes'>\n    <input type=\"text\" />\n    <label>MM</label>\n  </span>\n\n  <span class='above-line'>:</span>\n\n  <span class='seconds'>\n    <input type=\"text\" />\n    <label>SS</label>\n  </span>\n\n  <span class='am_pm'>\n    <select>\n      <option>AM</option>\n      <option>PM</option>\n    </select>\n  </span>\n</div>",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-clock-o\"></span></span> Time",
    identity: "form"
  });

}).call(this);

(function() {
  Ccreator.registerField('website', {
    order: 35,
    view: "<input type='text' placeholder='http://' />",
    edit: "",
    addButton: "<span class=\"symbol\"><span class=\"fa fa-link\"></span></span> Website",
    identity: "form"
  });

}).call(this);

(function() {
  Ccreator.themeResource = ["penthause_1.jpg", "office_1.jpg", "office_2.jpg"];

}).call(this);

this["Ccreator"] = this["Ccreator"] || {};
this["Ccreator"]["templates"] = this["Ccreator"]["templates"] || {};

this["Ccreator"]["templates"]["edit/base"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( Ccreator.templates['edit/base_header']() )) == null ? '' : __t) +
'\n' +
((__t = ( Ccreator.templates['edit/common']() )) == null ? '' : __t) +
'\n' +
((__t = ( Ccreator.fields[rf.get(Ccreator.options.mappings.FIELD_TYPE)].edit({rf: rf}) )) == null ? '' : __t) +
'\n';

}
return __p
};

this["Ccreator"]["templates"]["edit/base_header"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-field-label\'>\n  <span data-rv-text="model.' +
((__t = ( Ccreator.options.mappings.LABEL )) == null ? '' : __t) +
'"></span>\n  <code class=\'field-type\' data-rv-text=\'model.' +
((__t = ( Ccreator.options.mappings.FIELD_TYPE )) == null ? '' : __t) +
'\'></code>\n  <span class=\'fa fa-arrow-right pull-right\'></span>\n</div>';

}
return __p
};

this["Ccreator"]["templates"]["edit/base_non_input"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p +=
((__t = ( Ccreator.templates['edit/base_header']() )) == null ? '' : __t) +
'\n' +
((__t = ( Ccreator.fields[rf.get(Ccreator.options.mappings.FIELD_TYPE)].edit({rf: rf}) )) == null ? '' : __t) +
'\n';

}
return __p
};

this["Ccreator"]["templates"]["edit/checkboxes"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {

 if(route == 'form') { ;
__p += '\n<label>\n\t<h5>Required:</h5>\n  <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Ccreator.options.mappings.REQUIRED )) == null ? '' : __t) +
'\' />\n  \n</label>\n<!-- label>\n  <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Ccreator.options.mappings.ADMIN_ONLY )) == null ? '' : __t) +
'\' />\n  Admin only\n</label -->\n';
 } else if(route == 'flow') { ;
__p += '\n<label class="switch-wrapper">\n\t<h5>Live:</h5>\n  <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Ccreator.options.mappings.REQUIRED )) == null ? '' : __t) +
'\' />\n  \n</label>\n';
 } else { ;
__p += '\n<label class="switch-wrapper">\n  <input type="checkbox" value="1" data-rv-checked=\'model.' +
((__t = ( Ccreator.options.mappings.CHECKED )) == null ? '' : __t) +
'\'>\n</label>\n<div class="toggle toggle-modern">\n';
 } ;
__p += '\n\n<script type="text/javascript">\n\t$(function() {\n\t\t$(\'.switch-wrapper input[type=checkbox]\').switchButton({\n            on_label: \'ON\',\n            off_label: \'OFF\'\n          })\n\t});\n</script>';

}
return __p
};

this["Ccreator"]["templates"]["edit/common"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Label</div>\n\n<div class=\'fb-common-wrapper\'>\n  <div class=\'fb-label-description\'>\n    ' +
((__t = ( Ccreator.templates['edit/label_description']() )) == null ? '' : __t) +
'\n  </div>\n  <div class=\'fb-common-checkboxes\'>\n    ' +
((__t = ( Ccreator.templates['edit/checkboxes']() )) == null ? '' : __t) +
'\n  </div>\n  <div class=\'fb-clear\'></div>\n</div>\n';

}
return __p
};

this["Ccreator"]["templates"]["edit/height_width"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<input type="text" name="" data-rv-value="model.' +
((__t = ( Ccreator.options.mappings.WIDTH )) == null ? '' : __t) +
'">';

}
return __p
};

this["Ccreator"]["templates"]["edit/integer_only"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Integer only</div>\n<label>\n  <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Ccreator.options.mappings.INTEGER_ONLY )) == null ? '' : __t) +
'\' />\n  Only accept integers\n</label>\n';

}
return __p
};

this["Ccreator"]["templates"]["edit/label_description"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<input type=\'text\' data-rv-input=\'model.' +
((__t = ( Ccreator.options.mappings.LABEL )) == null ? '' : __t) +
'\' />\n<textarea data-rv-input=\'model.' +
((__t = ( Ccreator.options.mappings.DESCRIPTION )) == null ? '' : __t) +
'\'\n  placeholder=\'Add a longer description to this field\'></textarea>';

}
return __p
};

this["Ccreator"]["templates"]["edit/light_slider"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="fb-edit-section-header">Adjust</div>\n<input id="slider" type="range" min="0" max="100" step="10"  data-rv-input="model.' +
((__t = ( Ccreator.options.mappings.LIGHT_SLIDER )) == null ? '' : __t) +
'"/>\n';

}
return __p
};

this["Ccreator"]["templates"]["edit/min_max"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Minimum / Maximum</div>\n\nAbove\n<input type="text" data-rv-input="model.' +
((__t = ( Ccreator.options.mappings.MIN )) == null ? '' : __t) +
'" style="width: 30px" />\n\n&nbsp;&nbsp;\n\nBelow\n<input type="text" data-rv-input="model.' +
((__t = ( Ccreator.options.mappings.MAX )) == null ? '' : __t) +
'" style="width: 30px" />\n';

}
return __p
};

this["Ccreator"]["templates"]["edit/min_max_length"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Length Limit</div>\n\nMin\n<input type="text" data-rv-input="model.' +
((__t = ( Ccreator.options.mappings.MINLENGTH )) == null ? '' : __t) +
'" style="width: 30px" />\n\n&nbsp;&nbsp;\n\nMax\n<input type="text" data-rv-input="model.' +
((__t = ( Ccreator.options.mappings.MAXLENGTH )) == null ? '' : __t) +
'" style="width: 30px" />\n\n&nbsp;&nbsp;\n\n<select data-rv-value="model.' +
((__t = ( Ccreator.options.mappings.LENGTH_UNITS )) == null ? '' : __t) +
'" style="width: auto;">\n  <option value="characters">characters</option>\n  <option value="words">words</option>\n</select>\n';

}
return __p
};

this["Ccreator"]["templates"]["edit/options"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Options</div>\n\n';
 if (typeof includeBlank !== 'undefined'){ ;
__p += '\n  <label>\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Ccreator.options.mappings.INCLUDE_BLANK )) == null ? '' : __t) +
'\' />\n    Include blank\n  </label>\n';
 } ;
__p += '\n\n<div class=\'option\' data-rv-each-option=\'model.' +
((__t = ( Ccreator.options.mappings.OPTIONS )) == null ? '' : __t) +
'\'>\n  <input type="checkbox" class=\'js-default-updated\' data-rv-checked="option:checked" />\n  <input type="text" data-rv-input="option:label" class=\'option-label-input\' />\n  <a class="js-add-option ' +
((__t = ( Ccreator.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Add Option"><i class=\'fa fa-plus-circle\'></i></a>\n  <a class="js-remove-option ' +
((__t = ( Ccreator.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Remove Option"><i class=\'fa fa-minus-circle\'></i></a>\n</div>\n\n';
 if (typeof includeOther !== 'undefined'){ ;
__p += '\n  <label>\n    <input type=\'checkbox\' data-rv-checked=\'model.' +
((__t = ( Ccreator.options.mappings.INCLUDE_OTHER )) == null ? '' : __t) +
'\' />\n    Include "other"\n  </label>\n';
 } ;
__p += '\n\n<div class=\'fb-bottom-add\'>\n  <a class="js-add-option ' +
((__t = ( Ccreator.options.BUTTON_CLASS )) == null ? '' : __t) +
'">Add option</a>\n</div>\n';

}
return __p
};

this["Ccreator"]["templates"]["edit/size"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Size</div>\n<select data-rv-value="model.' +
((__t = ( Ccreator.options.mappings.SIZE )) == null ? '' : __t) +
'">\n  <option value="small">Small</option>\n  <option value="medium">Medium</option>\n  <option value="large">Large</option>\n</select>\n';

}
return __p
};

this["Ccreator"]["templates"]["edit/thermal_slider"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class="fb-edit-section-header">Adjust</div>\n<input id="slider" type="range" min="0" max="100" step="1"  data-rv-input="model.' +
((__t = ( Ccreator.options.mappings.THERMAL_SLIDER )) == null ? '' : __t) +
'"/>\n';

}
return __p
};

this["Ccreator"]["templates"]["edit/units"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-edit-section-header\'>Units</div>\n<input type="text" data-rv-input="model.' +
((__t = ( Ccreator.options.mappings.UNITS )) == null ? '' : __t) +
'" />\n';

}
return __p
};

this["Ccreator"]["templates"]["page"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '\n' +
((__t = ( Ccreator.templates['partials/save_button']() )) == null ? '' : __t) +
'\n' +
((__t = ( Ccreator.templates['partials/player']() )) == null ? '' : __t) +
'\n<div class="' +
((__t = ( route )) == null ? '' : __t) +
'">\n\t' +
((__t = ( Ccreator.templates['partials/left_side']() )) == null ? '' : __t) +
'\n\t' +
((__t = ( Ccreator.templates['partials/right_side']() )) == null ? '' : __t) +
'\n\t<div class=\'fb-clear\'></div>\n</div>\n';

}
return __p
};

this["Ccreator"]["templates"]["partials/add_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class=\'fb-tab-pane active\' id=\'addField\'>\n  <div class=\'fb-add-field-types\'>\n    <div class=\'section\'>\n      ';
 _.each(_.sortBy(Ccreator.inputFields, 'order'), function(f){ ;
__p += '\n        <a data-field-type="' +
((__t = ( f.field_type )) == null ? '' : __t) +
'" class="' +
((__t = ( Ccreator.options.BUTTON_CLASS )) == null ? '' : __t) +
' ' +
((__t = ( f.identity)) == null ? '' : __t) +
'">\n          ' +
((__t = ( f.addButton )) == null ? '' : __t) +
'\n        </a>\n      ';
 }); ;
__p += '\n    </div>\n\n  </div>\n</div>\n';

}
return __p
};

this["Ccreator"]["templates"]["partials/edit_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-tab-pane\' id=\'editField\'>\n  <div class=\'fb-edit-field-wrapper\'></div>\n</div>\n';

}
return __p
};

this["Ccreator"]["templates"]["partials/left_side"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-left\'>\n  <ul class=\'fb-tabs\'>\n    <li class=\'active\'>\n    \t<a data-target=\'#addField\'><i class="fa fa-puzzle-piece icon-left-menu" aria-hidden="true"></i></a>\n    </li>\n    <li class="theme">\n    \t<a data-target=\'#themeField\'><i class="fa fa-th-large icon-left-menu" aria-hidden="true"></i></a>\n    </li>\n    <li>\n    \t<a data-target=\'#editField\'><i class="fa fa-pencil-square-o icon-left-menu" aria-hidden="true"></i></a>\n    </li>\n  </ul>\n\n  <div class=\'fb-tab-content\'>\n    ' +
((__t = ( Ccreator.templates['partials/add_field']() )) == null ? '' : __t) +
'\n    ' +
((__t = ( Ccreator.templates['partials/theme_field']() )) == null ? '' : __t) +
'\n    ' +
((__t = ( Ccreator.templates['partials/edit_field']() )) == null ? '' : __t) +
'\n  </div>\n</div>';

}
return __p
};

this["Ccreator"]["templates"]["partials/player"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div id="dialog" title="Flow Demo">\n  <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/cIwBNg2ICLk?rel=0&amp;autoplay=1" frameborder="0" gesture="media" allow="encrypted-media" allowfullscreen></iframe>\n</div>';

}
return __p
};

this["Ccreator"]["templates"]["partials/right_side"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-right\'>\n\t<div class="right-section">\n\t\t<div class=\'fb-no-response-fields\'>No response Nodes</div>\n\t\t<div class=\'fb-response-fields\'></div>\n\t\t<input type="hidden" name="" class="storeArray"/><input type="hidden" class="getUIindex" name=""/>\n\t</div>\n</div>\n';

}
return __p
};

this["Ccreator"]["templates"]["partials/save_button"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'fb-save-wrapper\'>\n\t<span class=\'js-save-form ' +
((__t = ( Ccreator.options.BUTTON_CLASS )) == null ? '' : __t) +
'\' style="width: 0%;"></span>  \n\t<!-- <div class="progress font-weight-bold">\n\t\t<div class="progress-bar progress-bar-info js-save-form" role="progressbar" aria-valuenow="50"\n\t\taria-valuemin="0" aria-valuemax="100" style="width:0%">\n\t\t<span>0</span>% Complete (info)\n\t</div>\n</div> -->\n<div style="width: 100%;float: left;">\n<i class="fa fa-chevron-circle-left back-tool" aria-hidden="true"  onclick="window.history.back()"></i> Back\n<button class="btn btn-info position-save"><i class="fa fa-sitemap" aria-hidden="true"></i> Draw line</button>\n</div>\n</div>\n';

}
return __p
};

this["Ccreator"]["templates"]["partials/theme_field"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class=\'fb-tab-pane\' id=\'themeField\'>\n  <div class=\'fb-theme-field-wrapper\'>\n  \t';
 _.each(Ccreator.themeResource, function(f){ ;
__p += '\n  \t\t<img src="vendor/img/' +
((__t = ( f )) == null ? '' : __t) +
'" class="img-responsive theme-img">\n  \t';
 }); ;
__p += '\n  </div>\n</div>';

}
return __p
};

this["Ccreator"]["templates"]["view/base"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<div class=\'subtemplate-wrapper\'>\n  <div class=\'cover\'></div>\n  ';
 if (route != 'interior') { ;
__p += '\n  ' +
((__t = ( Ccreator.templates['view/label']({rf: rf}) )) == null ? '' : __t) +
'\n\n  \n\n  ' +
((__t = ( Ccreator.templates['view/description']({rf: rf}) )) == null ? '' : __t) +
'\n  ' +
((__t = ( Ccreator.templates['view/duplicate_remove']({rf: rf}) )) == null ? '' : __t) +
'\n  ';
 } ;
__p += '\n  ' +
((__t = ( Ccreator.fields[rf.get(Ccreator.options.mappings.FIELD_TYPE)].view({rf: rf}) )) == null ? '' : __t) +
'\n  ' +
((__t = ( Ccreator.templates['view/duplicate_remove']({rf: rf}) )) == null ? '' : __t) +
'\n</div>\n';

}
return __p
};

this["Ccreator"]["templates"]["view/base_non_input"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '';

}
return __p
};

this["Ccreator"]["templates"]["view/description"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<span class=\'help-block\'>\n  ' +
((__t = ( Ccreator.helpers.simple_format(rf.get(Ccreator.options.mappings.DESCRIPTION)) )) == null ? '' : __t) +
'\n</span>\n';

}
return __p
};

this["Ccreator"]["templates"]["view/duplicate_remove"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<div class=\'actions-wrapper\'>\n  <a class="js-duplicate ' +
((__t = ( Ccreator.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Duplicate Field"><i class=\'fa fa-plus-circle\'></i></a>\n  <a class="js-clear ' +
((__t = ( Ccreator.options.BUTTON_CLASS )) == null ? '' : __t) +
'" title="Remove Field"><i class=\'fa fa-minus-circle\'></i></a>\n</div>';

}
return __p
};

this["Ccreator"]["templates"]["view/label"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape, __j = Array.prototype.join;
function print() { __p += __j.call(arguments, '') }
with (obj) {
__p += '<label>\n  <span>' +
((__t = ( Ccreator.helpers.simple_format(rf.get(Ccreator.options.mappings.LABEL)) )) == null ? '' : __t) +
'\n  ';
 if (rf.get(Ccreator.options.mappings.REQUIRED)) { ;
__p += '\n    <abbr title=\'required\'>*</abbr>\n  ';
 } ;
__p += '\n</label>\n';

}
return __p
};