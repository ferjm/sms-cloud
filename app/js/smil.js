/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/*global Utils, WBMP, TextEncoder */

(function() {
'use strict';

// characters not allowed in smil filenames
var unsafeFilenamePattern = /[^a-zA-Z0-9_#.()?&%-]/g;

// This encoder is aimed for encoding the string by 'utf-8'.
var encoder = new TextEncoder('UTF-8');

// For utilizing sending/receiving DOM API, we need to handle 2 basic object
// first: SMIL document and attachment. SMIL document is used for
// representing the layout of the mms message, and attachment contains media
// source and text. In mms message layout, one message could be split into
// one or more slides. One slide could contain at most one media with/without
// a text string. For example:

/*
Layout of a mms message with 3 slides
===================
 ---------
 | img 1 |
 ---------   <- Slide 1
 string 1

 ===================
 ---------
 | img 2 |
 ---------   <- Slide 2


 ===================
 -----------
 | video 1 |
 ----------- <- Slide 3
 string 2

 ===================

*/

// In this case, all the media files(img1/img2/video1) and text string
// (string1/string2) will be converted into 5 attachments, and SMIL should
// illustrate that this mms message contains 3 slides and the attachment's
// name/layout... in each slide. Here we provide parse and generate utils
// for developers to focus on the necessary information in slides.


// this is a reduce function applied to the array of slides passed to
// SMIL.generate - data will have an attachments and slides array
// slide will be a single "slide", which can have text and an attachment
// See the description of these formats in the comment before
function SMIL_generateSlides(data, slide, slideIndex) {
  // default duration to 5 seconds per slide
  var DURATION = 5000;

  var id;
  var blobType;
  // each slide can have a piece of media and/or text
  var media = '';
  var text = '';
  var name = '';
  if (slide.blob) {
    blobType = Utils.typeFromMimeType(slide.blob.type);
    if (blobType) {
      name = slide.name.substr(slide.name.lastIndexOf('/') + 1);
      // just to be safe, remove any non-standard characters from the filename
      name = name.replace(unsafeFilenamePattern, '#');
      name = SMIL_generateUniqueLocation(data, name);
      media = '<' + blobType + ' src="' + name + '" region="Image"/>';
      data.attachments.push({
        id: '<' + name + '>',
        location: name,
        content: slide.blob
      });
    }
  }
  if (slide.text) {
    // Set text region.
    id = 'text_' + slideIndex + '.txt';
    text = '<text src="' + id + '" region="Text"/>';

    // The text of the content blob should always be encoded by 'utf-8'.
    data.attachments.push({
      id: '<' + id + '>',
      location: id,
      content: new Blob([encoder.encode(slide.text)], {type: 'text/plain'})
    });
  }
  data.parts.push('<par dur="' + DURATION + 'ms">' + media + text + '</par>');
  return data;
}

function SMIL_generateUniqueLocation(data, location) {
  var extension, name, result;

  // Need to add reference spec here
  var FILENAME_LIMIT = 40;

  // if the location is already being used by the attachment
  function SMIL_uniqueLocationMatches(attachment) {
    return attachment.location === result;
  }

  // Check if a file extension exists
  // Cache index of last non-extension portion of the filename
  var index = location.lastIndexOf('.');
  if (index === -1) {
    name = location;
    // Set to empty string so we can check length and append it to things
    extension = '';
  } else {
    // Cache potential file extension
    extension = location.slice(index);
    name = location.slice(0, index);
  }

  // First truncate below the limit to make de-duplicating worthwhile
  if (name.length + extension.length > FILENAME_LIMIT) {
    name = name.slice(0, FILENAME_LIMIT - extension.length);
  }
  result = name + extension;

  var duplicateIndex = 2;
  // If result is identical to any other attached files
  // add a duplicate marker and recheck the length
  while (data.attachments.some(SMIL_uniqueLocationMatches)) {
    var truncIndex = 0;
    // Construct a de-deuplicated name with the extention and
    // update duplicate index in case de-duplicated name is already chosen
    result = name + '_' + duplicateIndex++ + extension;
    // Truncate until the name (no longer needs to be de-duplicated)
    // and extension are below the limit
    while (result.length > FILENAME_LIMIT) {
      duplicateIndex = 2;
      name = name.slice(0, --truncIndex);
      result = name + extension;
    }
  }
  return result;
}

window.SMIL = {

  // SMIL.parse - takes a message from the DOM API's and converts to a
  // simple array format:

  // message.smil = valid SMIL string, or falsey
  // message.attachments = []
  // message.attachments[].content = blob
  // message.attachments[].location = src attr in smil

  // callback(parsedArray):
  // parsedArray = []
  // parsedArray[].text = 'plain text'
  // parsedArray[].name = name of key
  // parsedArray[].blob = data blob

  parse: function SMIL_parse(message, callback) {
    var smil = message.smil;
    var attachments = message.attachments;
    var slides = [];
    var activeReaders = 0;
    var attachmentsNotFound = false;
    var smilMismatched = false;
    var doc;
    var parTags;

    function readTextBlob(blob, callback) {

      // short circuit on null blobs
      if (!blob) {
        return callback('');
      }

      var textReader = new FileReader();
      textReader.onload = function(event) {
        activeReaders--;
        callback(event, event.target.result);
      };
      textReader.onerror = function(event) {
        console.error('Error reading text blob');
        activeReaders--;
        callback(event, '');
      };
      activeReaders++;

      // The text blob must be encoded as 'utf-8' by Gecko.
      textReader.readAsText(blob, 'UTF-8');
    }

    function exitPoint() {
      if (!activeReaders) {
        setTimeout(callback.bind(null, slides));
      }
    }

    function findAttachment(name) {
      var index = 0;
      var length = attachments.length;

      // strip the cid: prefix from some MMS encoders
      name = name.replace(/^cid:/, '');

      for (; index < length; index++) {
        if (attachments[index].location === name ||
            attachments[index].id === '<' + name + '>') {
          return attachments[index];
        }
      }
      return null;
    }

    function convertWbmpToPng(slide) {
      var reader;
      slide.name = slide.name.slice(0, -5) + '.png';
      reader = new FileReader();
      reader.onload = function(event) {
        WBMP.decode(event.target.result, function callback(blob) {
          activeReaders--;
          slide.blob = blob;
          exitPoint();
        });
      };
      reader.onerror = function(event) {
        activeReaders--;
        console.error('Error reading text blob');
        exitPoint();
      };
      activeReaders++;
      reader.readAsArrayBuffer(slide.blob);
    }

    // handle mms messages without smil
    // Display the attachments of the mms message in order
    function SMIL_parseWithoutSMIL(attachment, idx) {
      var blob = attachment.content;
      if (!blob) {
        return;
      }
      var type = Utils.typeFromMimeType(blob.type);

      // handle text blobs (plain text blob only) by reading them and
      // converting to text on the last slide
      if (type === 'text' && blob.type === 'text/plain') {
        readTextBlob(blob, function SMIL_parseAttachmentRead(event, text) {
          slides[idx] = {
            text: text
          };
          exitPoint();
        });

      // make sure the type was something we want, otherwise ignore it
      } else if (type) {
        var slide = { name: attachment.location, blob: attachment.content };
        if (slide.name && slide.name.slice(-5) === '.wbmp') {
          convertWbmpToPng(slide);
        }
        slides[idx] = slide;
      }
    }

    function SMIL_parseHandleParTag(par, index) {
      // stop parsing as soon as we fail to find one attachment
      if (attachmentsNotFound) {
        return;
      }

      var mediaElements = par.querySelectorAll('img, video, audio, ref');
      var textElement = par.querySelector('text');
      var attachment, src;

      Array.prototype.forEach.call(mediaElements, function setSlide(element) {
        var slide = {};
        src = element.getAttribute('src');
        attachment = findAttachment(src);
        if (attachment) {
          // every media attachment starts its own slide in our format
          slide = { name: attachment.location, blob: attachment.content };
          slides.push(slide);
          if (slide.name && slide.name.slice(-5) === '.wbmp') {
            convertWbmpToPng(slide);
          }
        } else {
          attachmentsNotFound = true;
        }
      });

      if (textElement) {
        src = textElement.getAttribute('src');
        attachment = findAttachment(src);

        if (attachment) {

          // check for text on the last slide
          var slide = slides[slides.length - 1];

          // if the last slide doesn't exist, or the last slide has text
          // already, we create a new slide to store the text
          if (!slide || typeof slide.text !== 'undefined') {
            slide = {};
            slides.push(slide);
          }
          // Init slide text to avoid text replaced by later blob
          slide.text = '';

          // read the text blob, and store it in the "slide" this function
          // will hold onto
          readTextBlob(attachment.content,
            function SMIL_parseSMILAttachmentRead(event, text) {
              slide.text = text;
              exitPoint();
            }
          );
        } else {
          attachmentsNotFound = true;
        }
      }
    }

    // handle MMS messages with SMIL
    if (smil) {
      doc = (new DOMParser()).parseFromString(smil, 'application/xml');
      parTags = doc.documentElement.getElementsByTagName('par');

      // Check if attachments are all listed in smil.
      var elements = Array.reduce(
        parTags, (count, par) => count + par.childElementCount, 0
      );

      if (elements !== attachments.length) {
        smilMismatched = true;
      } else {
        Array.prototype.forEach.call(parTags, SMIL_parseHandleParTag);
      }
    }

    // handle MMS attachments without SMIL / malformed SMIL
    if (!smil || attachmentsNotFound || !slides.length || smilMismatched) {
      // reset slides in the attachments not found case
      slides = Array(attachments.length);
      attachments.forEach(SMIL_parseWithoutSMIL);
    }
    exitPoint();
  },

  // SMIL.generate - takes a array with slides and return smil string and
  // attachment array.
  generate: function SMIL_generate(slides) {
    var HEADER = '<head><layout>' +
                 '<root-layout width="320px" height="480px"/>' +
                 '<region id="Image" left="0px" top="0px"' +
                 ' width="320px" height="320px" fit="meet"/>' +
                 '<region id="Text" left="0px" top="320px"' +
                 ' width="320px" height="160px" fit="meet"/>' +
                 '</layout></head>';

    // generate html from each slide while storing the actual attachment
    // in the attachments array.
    var data = slides.reduce(SMIL_generateSlides, {
      attachments: [],
      parts: []
    });

    // join the html parts together
    data.smil = '<smil>' + HEADER + '<body>' +
                data.parts.join('') +
                '</body></smil>';

    // the API doesn't care about 'parts', clean it up
    delete data.parts;

    return data;
  }
};

})();
