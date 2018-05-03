Ccreator.registerField 'checkboxes',

  order: 10

  view: """
    <% for (i in (rf.get(Ccreator.options.mappings.OPTIONS) || [])) { %>
      <div>
        <label class='fb-option'>
          <input type='checkbox' <%= rf.get(Ccreator.options.mappings.OPTIONS)[i].checked && 'checked' %> onclick="javascript: return false;" />
          <%= rf.get(Ccreator.options.mappings.OPTIONS)[i].label %>
        </label>
      </div>
    <% } %>

    <% if (rf.get(Ccreator.options.mappings.INCLUDE_OTHER)) { %>
      <div class='other-option'>
        <label class='fb-option'>
          <input type='checkbox' />
          Other
        </label>

        <input type='text' />
      </div>
    <% } %>
  """

  edit: """
    <%= Ccreator.templates['edit/options']({ includeOther: true }) %>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-square-o"></span></span> Checkboxes
  """
  identity: """
      form
  """

  defaultAttributes: (attrs) ->
    attrs.field_options.options = [
      label: "",
      checked: false
    ,
      label: "",
      checked: false
    ]

    attrs