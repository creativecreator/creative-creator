Ccreator.registerField 'number',

  order: 30

  view: """
    <input type='text' />
    <% if (units = rf.get(Ccreator.options.mappings.UNITS)) { %>
      <%= units %>
    <% } %>
  """

  edit: """
    <%= Ccreator.templates['edit/min_max']() %>
    <%= Ccreator.templates['edit/units']() %>
    <%= Ccreator.templates['edit/integer_only']() %>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-number">123</span></span> Number
  """
  identity: """
    form
  """