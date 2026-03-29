<script>
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('rucksendeangabe, vermerkzone, anschriftzone, datum, betreff, textfeld, seitenangabe, fusszeile').forEach(function (element) {
      element.setAttribute('contenteditable', 'true');
      element.setAttribute('role', 'textbox');
      element.setAttribute('aria-label', element.tagName.charAt(0).toUpperCase() + element.tagName.slice(1).toLowerCase());
    });
  });
</script>

