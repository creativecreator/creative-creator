Ccreator.registerField 'light',

  order: 50

  view: """
    <i class="fa fa-lightbulb-o symbol" aria-hidden="true"></i>
  """

  edit: """
    <%= Ccreator.templates['edit/light_slider']() %>
  """
  addButton: """
    <span class="symbol"><span class="fa fa-lightbulb-o "></span></span> Light
  """
  identity: """
    interior
  """
