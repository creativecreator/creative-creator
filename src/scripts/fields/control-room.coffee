Ccreator.registerField 'control',

  order: 0

  view: """
    <span class='fa fa-cogs font-xxx-large'></span>
  """

  edit: """
    
  """

  addButton: """
    <span class='symbol'><span class='fa fa-cogs'></span></span> Control
  """
  identity: """
    flow
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.size = 'small'
    attrs.label = 'Control Room'
    attrs
