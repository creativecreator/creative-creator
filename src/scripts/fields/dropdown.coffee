Ccreator.registerField 'dropdown',

  order: 24

  view: """
    <select>
      <% if (rf.get(Ccreator.options.mappings.INCLUDE_BLANK)) { %>
        <option value=''></option>
      <% } %>

      <% for (i in (rf.get(Ccreator.options.mappings.OPTIONS) || [])) { %>
        <option <%= rf.get(Ccreator.options.mappings.OPTIONS)[i].checked && 'selected' %>>
          <%= rf.get(Ccreator.options.mappings.OPTIONS)[i].label %>
        </option>
      <% } %>
    </select>
  """

  edit: """
    <%= Ccreator.templates['edit/options']({ includeBlank: true }) %>
  """

  addButton: """
    <span class="symbol"><span class="fa fa-caret-down"></span></span> Dropdown
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

    attrs.field_options.include_blank_option = false

    attrs