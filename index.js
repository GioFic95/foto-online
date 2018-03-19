      function handleChooseFolder(event) {
          event.preventDefault();
          var chooseFolderJQ = $("#choose-folder");
          chooseFolderJQ.hide();
          var folder = chooseFolderJQ.find("input[name=folder]");
          var folderVal = folder.val();
          var owner = chooseFolderJQ.find("input[name=owner]");
          var ownerVal = owner.val();
          console.log('folder: ' + folderVal, 'owner: ' + ownerVal);
          appendPre('<h2>Files in: ' + folderVal + ' by ' + ownerVal + '</h2>');
          listFiles(folderVal, ownerVal);
      }

      /**
       * Append a pre element to the body containing the given message
       * as its text node. Used to display the results of the API call.
       *
       * @param {string} message Text to be placed in pre element.
       */
      function appendPre(message) {
          /*
        var pre = document.getElementById('content');
        var textContent = document.createTextNode(message + '<br/>');
        pre.appendChild(textContent);
        */
          var content = $("#content");
          var contentHTML = content.html() + "<p>" + message + "</p>";
          content.html(contentHTML);
      }

      /**
       * Print files.
       */
      function listFiles(folder, owner) {
        gapi.client.drive.files.list({
          'q': "'" + owner + "' in owners and trashed = false and name contains '" + folder + "'",
          'pageSize': 1000,
          'fields': "nextPageToken, files(id)"
        }).then(function(response) {
            var files = response.result.files;
            if (files.length > 1) {
                console.log("ci sono più cartelle con questo nome");
                appendPre('ah scemo! non puoi mettere due cartelle con lo stesso nome');
                console.log(files);
            } else if (files.length === 0) {
                console.log("non ci sono cartelle con questo nome");
                appendPre('Folder not found.');
                throw "Folder not found!";
            } else {
                var folderID = response.result.files[0].id;
                console.log("folder id: ", folderID);

                var q = "'" + owner + "' in owners and trashed = false and '" + folderID + "' in parents";
                console.log(q);
                gapi.client.drive.files.list({
                  'q': q,
                  //'q': "'giovannificarra95@gmail.com' in owners and trashed = false and '1s_qOjiXvnhW2rrtFYoNTMFRob4BHImY9' in parents",
                  //'q': "'giovannificarra95@gmail.com' in owners and trashed = false and '" + folderID + "' in parents",
                  'pageSize': 1000,
                  'fields': "nextPageToken, files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink)",
                  'orderBy': "name"
                }).then(function(response) {
                  console.log("elaborating response...");
                  appendPre('Files:');
                  var files = response.result.files;
                  if (files && files.length > 0) {
                    for (var i = 0; i < files.length; i++) {
                      var file = files[i];
                      console.log(file);
                      var name = file.name.substring(0, file.name.lastIndexOf("."));
                      var content = name;
                      if (file.mimeType && file.mimeType.includes("image")) {
                          console.log(file.mimeType);
                          // content += "<img src='" + file.webViewLink + "'/><br/>";
                          var imgLink = file.webContentLink.substring(0, file.webContentLink.indexOf("&export"));
                          content += "<br/><img src='" + imgLink + "'/><br/>";
                          // content += "<img src='" + file.thumbnailLink + "'/><br/>";
                      } else if (file.mimeType && file.mimeType.includes("video")) {
                          console.log(file.mimeType);
                          // content += "<video> <source src='" + file.webViewLink + "'/> </video> <br/>";
                          var imgLink = file.webContentLink.substring(0, file.webContentLink.indexOf("&export"));
                          content += "<br/> <video controls> <source src='" + imgLink + "'/> </video> <br/>";
                          // content += "<video> <source src='" + file.thumbnailLink + "'/> </video> <br/>";
                      }
                      appendPre(content);
                    }
                  } else {
                    appendPre('Cartella non trovata.');
                  }
                });
            }
        });
      }