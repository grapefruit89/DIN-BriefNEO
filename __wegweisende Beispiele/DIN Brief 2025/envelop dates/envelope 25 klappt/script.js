const editorEle = document.getElementById('Inhalt');
editorEle.addEventListener('paste', function(e) {
 e.preventDefault();
 const text = (e.clipboardData) ? (e.originalEvent || e).clipboardData.getData('text/plain') : (window.clipboardData ? window.clipboardData.getData('Text') : '');
 if (document.queryCommandSupported('insertText')) {
  document.execCommand('insertText', false, text);
 } else {
  const range = document.getSelection().getRangeAt(0);
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.selectNodeContents(textNode);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
 }
});

;"use strict";
(function (window, document, $, gv) {
 var dataItems = [
  'address-overline',
  'address',
  'sidebar-text',
  'body-subject',
  'body-text',
  'attachments-bd'
 ];
 absenderzeile = function() {
  var name = $('#Name').text();
  var initiale = name.split(' ')[0].substring(0, 1).toUpperCase()+". ";
  var nacname = name.split(' ')[1]+", ";
  var bigaft = nacname[0].toUpperCase() + nacname.slice(1); 
  var street = $('#Straße').text()+", ";
  var newstreet = street.replace(/Strasse/i, "Straße");
  var place = $('#Ort').text(); 
  var abk = place.replace(/Sankt/i, "St.");
  var fertig = initiale + bigaft + newstreet + abk;
  $('#ruecksende').text(fertig);
  $('#yourname').text(name);
 }
 gv.createDateGerman = function() {
  var months = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  var date = new Date();
  var day = date.getDate();
  var month = months[date.getMonth()];
  var year = date.getFullYear();
  return day + '. ' + month + ' ' + year;
 }
 gv.setTitleFromSubject = function() {
  var title = $('#Betreff').text().trunc(60, true);
  var date = new Date();
  var day = ('0' + date.getDate()).slice(-2);
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var year = date.getFullYear();
  var docdate = year + '-' + month + '-' + day + ' ';
  document.title = docdate + title;
 }
 gv.getDraft = function() {
  return JSON.parse(localStorage.getItem('draft'));
 }
 gv.restoreDraft = function() {
  var draft = gv.getDraft();
  if (draft !== null) {
   for (var i = 0; i < dataItems.length; i++) {
    $('.' + dataItems[i] + ':eq(0)').html(draft[dataItems[i]]);
   }
   return true;
  }
  return false;
 }
 gv.saveDraft = function() {
  var draft = {};
  for (var i = 0; i < dataItems.length; i++) {
   var data = $('.' + dataItems[i] + ':eq(0)').html();
   if (typeof data !== 'undefined') {
    draft[dataItems[i]] = data;
   }
  }
  localStorage.setItem('draft', JSON.stringify(draft));
 }
 gv.deleteDraft = function() {
  localStorage.removeItem('draft');
 }
 gv.triggerStorageInfo = function() {
  if (gv.getDraft() == null) {
   $('.clear-storage-btn').removeClass('is-visible');
  } else {
   $('.clear-storage-btn').addClass('is-visible');
  }
 }
 String.prototype.trunc = function(n, useWordBoundary) {
  var toLong = this.length > n,
   s_ = toLong ? this.substr(0, n - 1) : this;
  s_ = useWordBoundary && toLong ? s_.substr(0, s_.lastIndexOf(' ')) : s_;
  return s_;
 };
 if (window.applicationCache) {
  applicationCache.addEventListener('updateready', function() {
   if (confirm('Es gibt eine neue Version des Briefgenerators. Seite neu Laden?')) {
    window.location.reload();
   }
  });
 }
 $(document).ready(function() {
  if (!gv.restoreDraft()) {
   $('#Datum').html(gv.createDateGerman());
  }
  gv.triggerStorageInfo();
  gv.setTitleFromSubject();
  $('[contenteditable]').on('input propertychange paste', function(e) {
   gv.saveDraft();
   gv.triggerStorageInfo();
  });
  $('.clear-storage-btn').on('click', function(e) {
   e.preventDefault();
   if (confirm('Der Entwurf wird endgültig gelöscht. Bist du dir sicher?')) {
    gv.deleteDraft();
    gv.triggerStorageInfo();
    window.location.reload();
   }
  });
  $('.body-subject').on('input propertychange paste', function(e) {
   gv.setTitleFromSubject();
  });
  $('.sidebar-text').on('input propertychange paste', function(e) {
   absenderzeile();
  });
 });
})(window, document, jQuery.noConflict(), window.gv = window.gv || {});

