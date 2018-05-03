Ccreator.registerField 'system',

  order: 30

  view: """
    <i class="fa fa-laptop font-xxx-large" aria-hidden="true"></i>
    <i class="fa fa-mail-forward" style="position:absolute;top:0;right:2px;z-index:9;" onclick="location.href=\'form.html\'" aria-hidden="true"></i>
  """

  edit: """
    <%= Ccreator.templates['edit/integer_only']() %>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-laptop"></span></span> System 
  """
  identity: """
    flow
  """

  defaultAttributes: (attrs) ->
      attrs.label = 'System'
      attrs