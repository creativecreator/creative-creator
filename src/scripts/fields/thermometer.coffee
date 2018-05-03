Ccreator.registerField 'thermometer',

  order: 50

  view: """
    <i class="fa fa-thermometer-half symbol" aria-hidden="true"></i>
    <h5 class="bold">
      <%= rf.get(Ccreator.options.mappings.THERMAL_SLIDER) %> %
    </h5>
  """

  edit: """
    <%= Ccreator.templates['edit/thermal_slider']() %>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-thermometer-half"></span></span> Thermometer
  """
  identity: """
    interior
  """

  defaultAttributes: (attrs) ->
    # attrs.field_options.resize.width = '20px'
    console.log attrs.field_options.resize
    attrs