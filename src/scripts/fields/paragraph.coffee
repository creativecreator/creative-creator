Ccreator.registerField 'paragraph',

  order: 5

  view: """
    <textarea class='rf-size-<%= rf.get(Ccreator.options.mappings.SIZE) %>'></textarea>
  """

  edit: """
    <%= Ccreator.templates['edit/size']() %>
    <%= Ccreator.templates['edit/min_max_length']() %>
  """

  addButton: """
    <span class="symbol">&#182;</span> Paragraph
  """
  identity: """
    form
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.size = 'small'
    attrs
