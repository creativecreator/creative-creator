class CreativeModel extends Backbone.DeepModel
  sync: -> # noop
  indexInDOM: ->
    $wrapper = $(".fb-field-wrapper").filter ( (_, el) => $(el).data('cid') == @cid  )
    $(".fb-field-wrapper").index $wrapper
  is_input: ->
    Ccreator.inputFields[@get(Ccreator.options.mappings.FIELD_TYPE)]?


class CreativeCollection extends Backbone.Collection
  initialize: ->
    @on 'add', @copyCidToModel

  model: CreativeModel

  comparator: (model) ->
    model.indexInDOM()

  copyCidToModel: (model) ->
    model.attributes.cid = model.cid


class ViewFieldView extends Backbone.View
  className: "fb-field-wrapper "

  events:
    'click .subtemplate-wrapper': 'focusEditView'
    'click .js-duplicate': 'duplicate'
    'click .js-clear': 'clear'

  initialize: (options) ->
    {@parentView} = options
    that = @
    @listenTo @model, "change", @render
    @listenTo @model, "destroy", @remove 
    @$el.addClass('node-'+@.model.get('cid'))
    
    if @parentView.mode != 'view'
        @$el.draggable
          disabled: false,
          cursor : "move",
          containment: "parent",
          snap: true,
          drag: (i, val) =>

          stop: (event, ui) =>
            pos = ui.position
            @model.set(Ccreator.options.size.LEFT, pos.left)
            @model.set(Ccreator.options.size.TOP, pos.top)
        
          # console.log(ui.helper.remove())
          # @parentView.handleFormUpdate() 
    return
  render: ->
    @$el.addClass('response-field-' + @model.get(Ccreator.options.mappings.FIELD_TYPE)).css                
          'left': @model.get(Ccreator.options.size.LEFT)
          'top': @model.get(Ccreator.options.size.TOP)
          'width':@model.get(Ccreator.options.mappings.WIDTH)
          'height':@model.get(Ccreator.options.mappings.HEIGHT)
          'box-shadow': '0px 0px '+@model.get(Ccreator.options.mappings.LIGHT_SLIDER)+'px #fff, #fff 0px 0px '+@model.get(Ccreator.options.mappings.LIGHT_SLIDER)+'px inset';
        .data('cid', @model.cid)
        .html(Ccreator.templates["view/base#{if !@model.is_input() then '_non_input' else ''}"]({rf: @model}))

    return @

  focusEditView: ->  
   if @parentView.mode != 'view'
      # ...
      @parentView.createAndShowEditView(@model)


  clear: (e) ->
    e.stopPropagation()
    e.preventDefault()    

    cb = =>
      @parentView.handleFormUpdate()
      @model.destroy()
      

    x = Ccreator.options.CLEAR_FIELD_CONFIRM

    switch typeof x
      when 'string'
        if confirm(x) then cb()
      when 'function'
        x(cb)
      else
        cb()
    
    filtered = _.filter(@parentView.cconnect, (item) =>
      return item.start != '.node-'+@model.attributes.cid
    )
    filteredLast = _.filter(filtered, (item) =>
       return item.end != '.node-'+@model.attributes.cid
    )
    @parentView.cconnectArr = filteredLast
    # if route == 'flow'
    @parentView.connectLine(@parentView.pathStroke, @parentView.pathOrientation, @parentView.pathOffset, @parentView.cconnectArr, @parentView.arrowHead)

  duplicate: ->
    attrs = _.clone(@model.attributes)
    delete attrs['id']
    attrs['label'] += ' Copy'
    @parentView.createField attrs, { position: @model.indexInDOM() + 1 }


class EditFieldView extends Backbone.View
  className: "edit-response-field"

  events:
    'click .js-add-option': 'addOption'
    'click .js-remove-option': 'removeOption'
    'click .js-default-updated': 'defaultUpdated'
    'input .option-label-input': 'forceRender'
    

  initialize: (options) ->
    {@parentView} = options
    @listenTo @model, "destroy", @remove    
    
  render: ->
    @$el.html(Ccreator.templates["edit/base#{if !@model.is_input() then '_non_input' else ''}"]({rf: @model}))
    rivets.bind @$el, { model: @model }
    
    return @

  remove: ->
    @parentView.editView = undefined
    @parentView.$el.find("[data-target=\"#addField\"]").click()
    super

  # @todo this should really be on the model, not the view
  addOption: (e) ->
    $el = $(e.currentTarget)
    i = @$el.find('.option').index($el.closest('.option'))
    options = @model.get(Ccreator.options.mappings.OPTIONS) || []
    newOption = {label: "", checked: false}

    if i > -1
      options.splice(i + 1, 0, newOption)
    else
      options.push newOption

    @model.set Ccreator.options.mappings.OPTIONS, options
    @model.trigger "change:#{Ccreator.options.mappings.OPTIONS}"
    @forceRender()

  removeOption: (e) ->
    $el = $(e.currentTarget)
    index = @$el.find(".js-remove-option").index($el)
    options = @model.get Ccreator.options.mappings.OPTIONS
    options.splice index, 1
    @model.set Ccreator.options.mappings.OPTIONS, options
    @model.trigger "change:#{Ccreator.options.mappings.OPTIONS}"
    @forceRender()

  defaultUpdated: (e) ->
    $el = $(e.currentTarget)

    unless @model.get(Ccreator.options.mappings.FIELD_TYPE) == 'checkboxes' # checkboxes can have multiple options selected
      @$el.find(".js-default-updated").not($el).attr('checked', false).trigger('change')

    @forceRender()

  forceRender: ->
    @model.trigger('change')


  run: (e) ->
      $el = $(e.currentTarget)
      i = @$el.find('.fb-field-wrapper')
      __this = @

      resizeIt = (_this)=>
        $(_this).resizable
          handles: 's,e,n,w',
          cursor: 'move',
          disabled: false,
          animate: false,
          instance:false,
          # aspectRatio: true,
          start: (event, ui) =>
            # console.log __this
            # __this.parentView.createAndShowEditView(__this.model)
          stop: (event, ui) =>
            # console.log ui
            __this.model.set(Ccreator.options.mappings.WIDTH, ui.size.width)
            __this.model.set(Ccreator.options.mappings.HEIGHT, ui.size.height)
            __this.forceRender()

     

      if $($el).is('.ui-resizable')
        $($el).resizable('destroy')
        resizeIt($el)
      else
        resizeIt($el)         



class BuilderView extends Backbone.View
  SUBVIEWS: []

  events:
    'click .fb-field-wrapper': 'nodeOnFocus'
    'click .form': 'saveForm'
    'click .fb-tabs a': 'showTab'
    'click .fb-add-field-types a': 'addField'
    'click .position-save': 'dragLine'
    'focusout .position-save': 'removeActiveClass'
    'click svg': 'removeActiveClass'    
    'mouseover .fb-add-field-types': 'lockLeftWrapper'
    'mouseout .fb-add-field-types': 'unlockLeftWrapper'
    'click .theme-img': 'themeImage'
    'click path': 'removeRedPath'

  initialize: (options) ->
    {selector,
     @ccreator, 
     @bootstrapData,
     @background, 
     @builderType,
     @cconnect, 
     @pathStroke,
     @pathOrientation, 
     @pathOffset, 
     @arrowHead,
     @mode,
     @beforeunload} = options
    @cconnectArr = []
    # This is a terrible idea because it's not scoped to this view.
    if selector?
      @setElement $(selector)
    
    # Create the collection, and bind the appropriate events
    @collection = new CreativeCollection
    @collection.bind 'add', @addOne, @
    @collection.bind 'reset', @reset, @
    @collection.bind 'change', @handleFormUpdate, @
    @collection.bind 'destroy add reset', @hideShowNoResponseFields, @
    # @collection.bind 'destroy', @ensureEditViewScrolled, @
    @getResponseData()
    @render()
    @collection.reset(@bootstrapData)
    @bindSaveEvent()
    @triggerRoute()    

  triggerRoute: ->
    $('[data-field-type]').css('display', 'none')
    $('.'+@builderType ).css('display', 'block')
    switch @builderType     
      when 'form'
        $('.position-save').remove()
        $('.fb-main').css('background-color', '#fff')
        $('.fb-right').addClass('form-node-color')
        $(".theme").remove()
        $( "#dialog" ).remove()
        break
      when 'flow'
        @connectLine(@pathStroke, @pathOrientation, @pathOffset, @cconnect, @arrowHead)
        $('.fb-main').css('background-color', '#000')
        $('.fb-right').removeClass('form-node-color')
        $(".theme").remove()
        $('.player-modal').trigger("click")
        $( "#dialog" ).dialog({modal: true,width: 600});
        break
      else
        $('.position-save').remove()
        $('.fb-main').css('background-color', '#fff')
        $('.fb-right').addClass('form-node-color')
        $(".theme").remove()
        $( "#dialog" ).remove()
              
  nodeOnFocus: (e)->       
    $el = $(e.currentTarget)
    target = @.$el.find('.fb-field-wrapper')
    
    if @mode != 'view'
      thisIndxInc = @.editView.model.get('cid')
      startP = $('.storeArray').val()      
      $('.getUIindex').val(thisIndxInc)
      if route != 'flow'
        @.editView.run(e)    
      if target.hasClass('pulse-button')
        target.addClass('cyan lighten-3')
        if startP == ""              
          @removeDuplicatePath(@cconnect)
        
        else if startP != "" && $('.getUIindex').val() != startP              
          if target.hasClass('cyan lighten-3')
            endPoint = '.node-'+ thisIndxInc
            startPoint = '.node-'+ startP
            @cconnectObj = {
              'end':endPoint
              'start':startPoint                   
            }
               
            
        # else if $('.getUIindex').val() == startP 
        #   return
        

        $('.storeArray').val(thisIndxInc) 
        @cconnectArr.push(@cconnectObj)  
        delete @cconnectObj
         
        @cconnect =  _.without(@cconnectArr, _.findWhere(@cconnectArr, {}))
        @connectLine(@pathStroke, @pathOrientation, @pathOffset, @cconnect, @arrowHead)
      
      @handleFormUpdate()

  highlightPath: ()->
    setInterval ()->
      $("path").hover((e)->
          $(this).attr
            "stroke-width":8
        , ()->
          $(this).attr
            "stroke-width":5
        )       
      
  removeRedPath: (e)->
    e.stopPropagation()
    $el = $(e.currentTarget)
    if @mode != 'view'
      # ...
      $('path').attr
        "stroke":'#5bc0de'
      $($el).attr
        "stroke":'red'

  pathRemoveDelete: (e)->
    __this = @
    $(document).keyup((e)->
      if e.keyCode == 46
        path = $('path')
        
        pathRed = document.body.querySelector('path[stroke=red]')
        if pathRed
          $(path).each((i,v)->
              # console.log i,v
              if v == pathRed
                pathRed.remove()
                __this.cconnect.splice(i, 1)
                __this.cconnectArr = __this.cconnect

                __this.handleFormUpdate()
            )
        # else
        #   return
          
    )

  removeActiveClass: (e)->
    $el = $(e.currentTarget)
    target = @$el.find('.fb-field-wrapper')
    $(target).removeClass('pulse-button')
    $('.storeArray').val('') 
    @removeDuplicatePath(@cconnect)

  removeDuplicatePath: (cconnect)->
    uniqPath = _.uniq(_.collect(cconnect, (x)->
      return JSON.stringify(x)
      ))
    convrtObj = _.map(uniqPath, (num)-> return JSON.parse(num))
    @cconnect = convrtObj
    @connectLine(@pathStroke, @pathOrientation, @pathOffset, @cconnect, @arrowHead)

  dragLine: (e)->
    $el = $(e.currentTarget)
    target = @$el.find('.fb-field-wrapper')
    $(target).addClass('pulse-button')

  bindSaveEvent: ->
    @formSaved = true
    @saveFormButton = @$el.find(".js-save-form")
    @saveFormButton.attr('disabled', true).css('width', '0%')
    # @saveFormButton.css('width', '0%')
    # Here has added connector
    

    unless !Ccreator.options.AUTOSAVE
      setInterval =>
        @saveForm.call(@)
        # @removeDuplicatePath(@cconnect)
        $("svg:last-child").siblings('svg').remove()
      , 400
    if @beforeunload == false
      # ...    
      $(window).bind 'beforeunload', =>      
        if @formSaved then undefined else Ccreator.options.dict.UNSAVED_CHANGES

  connectLine: (@pathStroke, @pathOrientation, @pathOffset, @cconnect, @arrowHead)->
    $(".fb-response-fields").CCconnect({
        stroke: @pathStroke
        orientation: @pathOrientation
        offset: @pathOffset
        paths: @cconnect
        arrowHead: @arrowHead
      });

  reset: ->
    @$responseFields.html('')
    @addAll()

  render: ->
    @$el.html Ccreator.templates['page']()

    # Save jQuery objects for easy use
    @$fbLeft = @$el.find('.fb-left')
    @$responseFields = @$el.find('.fb-response-fields')
    @$fbLeft.attr
      'link':'flow'

    # @bindWindowScrollEvent()
    
    @hideShowNoResponseFields()
    @highlightPath()
    @pathRemoveDelete()
    # Render any subviews (this is an easy way of extending the Creative)
    new subview({parentView: @}).render() for subview in @SUBVIEWS

    return @

  bindWindowScrollEvent: ->
    $(window).on 'scroll', =>
      return if @$fbLeft.data('locked') == true
      newMargin = Math.max(0, $(window).scrollTop() - @$el.offset().top)
      maxMargin = @$responseFields.height()

      @$fbLeft.css
        'margin-top': Math.min(maxMargin, newMargin)

  showTab: (e) ->
    $el = $(e.currentTarget)
    target = $el.data('target')
    $el.closest('li').addClass('active').siblings('li').removeClass('active')
    $(target).addClass('active').siblings('.fb-tab-pane').removeClass('active')

    @unlockLeftWrapper() unless target == '#editField'

    if target == '#editField' && !@editView && (first_model = @collection.models[0])
      @createAndShowEditView(first_model)

  addOne: (responseField, _, options) ->
    view = new ViewFieldView
      model: responseField
      parentView: @

    #####
    # Calculates where to place this new field.
    #
    # Are we replacing a temporarily drag placeholder?
    if options.$replaceEl?
      options.$replaceEl.replaceWith(view.render().el)

    # Are we adding to the bottom?
    else if !options.position? || options.position == -1
      @$responseFields.append view.render().el

    # Are we adding to the top?
    else if options.position == 0
      @$responseFields.prepend view.render().el

    # Are we adding below an existing field?
    else if ($replacePosition = @$responseFields.find(".fb-field-wrapper").eq(options.position))[0]
      $replacePosition.before view.render().el

    # Catch-all: add to bottom
    else
      @$responseFields.append view.render().el

  setDroppable: ->
    # @$responseFields.sortable('destroy') if @$responseFields.hasClass('ui-sortable')
    @$responseFields.droppable
      greedy: true
      # forcePlaceholderSize: true
      placeholder: 'sortable-placeholder'
      drop: (e, ui) =>
        if ui.draggable.data('field-type')
          rf = @collection.create Ccreator.helpers.defaultFieldAttrs(ui.draggable.data('field-type')), {$replaceEl: ui.item}
          @createAndShowEditView(rf)
          pos = ui.position
          rightContain = document.querySelector('.fb-right')
          getRecent = @$el.find('.fb-field-wrapper.editing')
          lft = pos.left - $(rightContain).offset().left
          tp = pos.top - $(rightContain).offset().top
          $(getRecent).css({
            'left':  lft,
            'top': tp 
          })
          @editView.model.set(Ccreator.options.size.LEFT, lft)
          @editView.model.set(Ccreator.options.size.TOP, tp)
          
          @getTopLeft(parseInt(pos.left), parseInt(pos.top))
          # @run()
        @handleFormUpdate()
        return true
      update: (e, ui) =>

        # ensureEditViewScrolled, unless we're updating from the draggable
        # @ensureEditViewScrolled() unless ui.draggable.data('field-type')
    @setDraggable()

  getTopLeft: (left, top)->    
    link = $(".fb-left").attr('link')
    rightSideLeft = $(".fb-right").position().left
    leftSide = $(".fb-left."+link).width() 
    lft = leftSide += rightSideLeft;
    return topLeft = {
          'left' : left - 200,
          'top' : top
        }

  

  setDraggable: ->
    $addFieldButtons = @$el.find("[data-field-type]")

    $addFieldButtons.draggable
      connectToSortable: @$responseFields
      stop: (e, ui) =>
        cc = ui.helper.position()
      helper: =>
        $helper = $("<div class='response-field-draggable-helper' />")
        $helper.css
          width: '80px'
          height: '80px'
          'z-index': 99

        $helper

  addAll: ->
    @collection.each @addOne, @
    @setDroppable()

  hideShowNoResponseFields: ->
    @$el.find(".fb-no-response-fields")[if @collection.length > 0 then 'hide' else 'show']()

  addField: (e) ->
    field_type = $(e.currentTarget).data('field-type')
    @createField Ccreator.helpers.defaultFieldAttrs(field_type)

  createField: (attrs, options) ->
    rf = @collection.create attrs, options
    @createAndShowEditView(rf)
    @handleFormUpdate()

  createAndShowEditView: (model) ->
    $responseFieldEl = @$el.find(".fb-field-wrapper").filter( -> $(@).data('cid') == model.cid )
    $responseFieldEl.addClass('editing').siblings('.fb-field-wrapper').removeClass('editing')

    if @editView
      if @editView.model.cid is model.cid
        @$el.find(".fb-tabs a[data-target=\"#editField\"]").click()
        # @scrollLeftWrapper($responseFieldEl)
        return

      @editView.remove()

    @editView = new EditFieldView
      model: model
      parentView: @

    $newEditEl = @editView.render().$el
    @$el.find(".fb-edit-field-wrapper").html $newEditEl
    @$el.find(".fb-tabs a[data-target=\"#editField\"]").click()
    # @scrollLeftWrapper($responseFieldEl)
    return @

  parentBackgroundImage: (getImgSrc)->
    if @background == "" && $(".right-section")[0].style.backgroundImage == ""
          @background =  'vendor/img/'+Ccreator.themeResource[0]
    else
      
      # @background = getImgSrc   
      $(".right-section").attr("style", "background:url('"+
            @background+
            "')")
      

  themeImage: (e)->
    $el = $(e.currentTarget)
    target = $el.find('.theme-img')
    getImgSrc = target.prevObject.attr('src')
    # @.collection.models[0].set(Ccreator.options.theme.IMAGE, getImgSrc)
    @background = getImgSrc
    @parentBackgroundImage(@background)


  ensureEditViewScrolled: ->
    return unless @editView
    # @scrollLeftWrapper $(".fb-field-wrapper.editing")

  scrollLeftWrapper: ($responseFieldEl) ->
    @unlockLeftWrapper()
    return unless $responseFieldEl[0]
    $.scrollWindowTo ((@$el.offset().top + $responseFieldEl.offset().top) - @$responseFields.offset().top), 200, =>
      @lockLeftWrapper()

  lockLeftWrapper: ->
    @$fbLeft.data('locked', true)

  unlockLeftWrapper: ->
    @$fbLeft.data('locked', false)

  handleFormUpdate: ->
    return if @updatingBatch
    @formSaved = false
    @saveFormButton.removeAttr('disabled').css('width', '100%') 
    # @saveFormButton.css('width', '0%')

  saveForm: (e) ->
    return if @formSaved
    @formSaved = true
    @fields = {}
    @saveFormButton.attr('disabled', true).css('width', '0%')
    # @saveFormButton.css('width', '100%')
    @collection.sort()
    @fields[@builderType] = JSON.stringify @collection.toJSON()
    payload = @fields
    if Ccreator.options.HTTP_ENDPOINT then @doAjaxSave(payload)
    @ccreator.trigger 'save', {
      'fields':payload
      'connector':@cconnect
      'backImage':@background
      'type':@builderType
    }

  getResponseData: ->
    # console.log @builderType
    switch route
      when 'form'
        # @bootstrapData = []
        @builderType = 'form'
      when 'flow'
        # @bootstrapData = 
        @builderType = 'flow'
        # @cconnect = [
        #             {"end":".node-c2","start":".node-c6"},
        #             {"end":".node-c22","start":".node-c2"},
        #             {"end":".node-c18","start":".node-c22"},
        #             {"end":".node-c10","start":".node-c6"},
        #             {"end":".node-c14","start":".node-c22"}
        #           ]      


  doAjaxSave: (payload) ->
    $.ajax
      url: Ccreator.options.HTTP_ENDPOINT
      type: Ccreator.options.HTTP_METHOD
      data: payload
      contentType: "application/json"
      success: (data) =>
        @updatingBatch = true
        
        for datum in data
          # set the IDs of new response fields, returned from the server
          @collection.get(datum.cid)?.set({id: datum.id})
          @collection.trigger 'sync'

        @updatingBatch = undefined


class Ccreator
  @helpers:
    defaultFieldAttrs: (field_type) ->
      attrs = {}
      attrs[Ccreator.options.mappings.LABEL] = 'Untitled'
      attrs[Ccreator.options.mappings.FIELD_TYPE] = field_type
      attrs[Ccreator.options.mappings.LIGHT_SLIDER] = 5
      attrs['field_options'] = {}
      Ccreator.fields[field_type].defaultAttributes?(attrs) || attrs

    simple_format: (x) ->
      x?.replace(/\n/g, '<br />')

  @options:
    BUTTON_CLASS: 'fb-button'
    HTTP_ENDPOINT: ''
    HTTP_METHOD: 'POST'
    AUTOSAVE: true
    CLEAR_FIELD_CONFIRM: false

    mappings:
      SIZE: 'field_options.size'
      UNITS: 'field_options.units'
      LABEL: 'label'
      FIELD_TYPE: 'field_type'
      REQUIRED: 'required'
      CHECKED: 'checked'
      ADMIN_ONLY: 'admin_only'
      OPTIONS: 'field_options.options'
      DESCRIPTION: 'field_options.description'
      INCLUDE_OTHER: 'field_options.include_other_option'
      INCLUDE_BLANK: 'field_options.include_blank_option'
      INTEGER_ONLY: 'field_options.integer_only'
      MIN: 'field_options.min'
      MAX: 'field_options.max'
      MINLENGTH: 'field_options.minlength'
      MAXLENGTH: 'field_options.maxlength'
      LENGTH_UNITS: 'field_options.min_max_length_units'
      WIDTH:'field_options.resize.width'
      HEIGHT:'field_options.resize.height'
      LIGHT_SLIDER:'field_options.light_slider'
      THERMAL_SLIDER: 'field_options.thermal_slider'
    theme:
      IMAGE: 'imgSet'
    dict:
      ALL_CHANGES_SAVED: 'All changes saved'
      SAVE_FORM: 'Save form'
      UNSAVED_CHANGES: 'You have unsaved changes. If you leave this page, you will lose those changes!'      

    size:
      LEFT:'design.left'
      TOP:'design.top'
      

  @fields: {}
  @inputFields: {}
  @nonInputFields: {}

  @registerField: (name, opts) ->
    for x in ['view', 'edit']
      opts[x] = _.template(opts[x])

    opts.field_type = name

    Ccreator.fields[name] = opts

    if opts.type == 'non_input'
      Ccreator.nonInputFields[name] = opts
    else
      Ccreator.inputFields[name] = opts

  constructor: (opts={}) ->
    _.extend @, Backbone.Events
    args = _.extend opts, {ccreator: @}
    @mainView = new BuilderView args

window.Ccreator = Ccreator


# if module?
#   module.exports = Ccreator
# else
#   window.Ccreator = Ccreator
