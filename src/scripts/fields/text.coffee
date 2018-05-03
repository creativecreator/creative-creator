Ccreator.registerField 'text',

  order: 0

  view: """
    <input type='text' class='rf-size-<%= rf.get(Ccreator.options.mappings.SIZE) %>' />
  """

  edit: """
    <%= Ccreator.templates['edit/size']() %>
    <%= Ccreator.templates['edit/min_max_length']() %>
  """

  addButton: """
    <span class='symbol'><span class='fa fa-font'></span></span> Text
  """
  identity: """
    form
  """
  
  defaultAttributes: (attrs) ->
    attrs.field_options.size = 'small'
    attrs
