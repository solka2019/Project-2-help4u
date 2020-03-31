// Came from mapquest
L.mapquest.key = 'mwZodU08iNjRDmcuD2V3hw3zqVZ1cdTw';
// var to begin with - logic below
let loggingIn = false;
// cookie - saves info in my computer that I want to use again next time I run the website

const userCookieName = "4us-currentUser";

// Seattle's coordinates are default: 47.60357° N, -122.32945° E

// Client-side object to hold the user information (cookie saves it so eveytime user comes back to our website there is no need to login again)
let currentUser = {
  id: -1,
  name: "",
  email: "",
  latitude: "",
  longitude: "",
  address: "",
  address: "",
  locationSupport: false,
  loggedIn: false,
};

// Facebook integration
function checkLoginState() {
  // Called when a person is finished with the Login Button.
  console.log("checkLoginState");
  loggingIn = true;
  FB.getLoginStatus((response) => {
    // See the onlogin handler
    statusChangeCallback(response);
  });
  loggingIn = false;
}

function statusChangeCallback(response) {
  // Called with the results from FB.getLoginStatus().
  console.log('statusChangeCallback');
  console.log(response); // The current login status of the person.
  currentUser.loggedIn = false;
  localStorage.removeItem(userCookieName);
  if (response.status === 'connected') {
    // Logged into your webpage and Facebook.
    // Enabled to do anything
    testFBAPI();
  } else {
    // Can't get tasks or create tasks
    currentUser.loggedIn = false;
    currentUser.name = '';
    currentUser.email = false;
    currentUser.id = -1;
    // redirect to the main page without the userId in the querystring
    window.location.href = "/";
  }
}


function testFBAPI() {
  // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me?locale=en_US&fields=name,email', (response) => {
    currentUser.name = response.name;
    currentUser.email = response.email;

    console.log("Successful login for: " + response.name);
    console.log(response);


    // create the user in our backend
    $.ajax({
      type: "POST",
      url: "/api/createuser",
      contentType: "application/json",
      data: JSON.stringify(currentUser),
      success: function (data) {
        try {
          console.log(data);

          if (data.userId > 0) {
            currentUser.id = data.userId;
            currentUser.loggedIn = true;
            const val = JSON.stringify(currentUser);
            console.log('currentUser Value to store:' + val);
            localStorage.setItem(userCookieName, val);
            window.location.replace = '/?userId=' + currentUser.id;
          }
        }
        catch (e) {
          console.log(e);
        }
      },
      failure: function (errMsg) {
        alert(errMsg);
      }
    }).then(function (userInfo) {

    });
  });
}

// END - Facebook integration

// Mapquest integration - code from here: https://developer.mapquest.com/documentation/mapquest-js/v1.3/examples/geocoding-with-an-advanced-location-object/
function createMap(error, response) {
  var location = response.results[0].locations[0];
  var latLng = location.displayLatLng;
  var map = L.mapquest.map('map', {
    center: latLng,
    layers: L.mapquest.tileLayer('map'),
    zoom: 18
  });
}

// end of Map quest integration




// Help Basket page handlers
function renderMapFromTaskLocations(taskIdSelected, locationStart, locationEnd) {

  console.log("basket task selected = " + taskIdSelected);
  if (locationStart || locationEnd) {
    if (locationStart && !locationEnd) {
      // Show just the place
      L.mapquest.geocoding().geocode(locationStart);
    }
    else {
      // show the route between the two places. Code from here: https://developer.mapquest.com/documentation/mapquest-js/v1.3/examples/basic-directions/
      L.mapquest.directions().route({
        start: locationStart,
        end: locationEnd
      });
    }
  }
}

// This code linked allows to remove the rows from the table once clicked
//https://www.tutorialrepublic.com/faq/how-to-add-remove-table-rows-dynamically-using-jquery.php
function canHelpTaskChosen(taskIdSelected, locationStart, locationEnd) {
  alert();
  //canHelpTaskOption radio button row to remove after accepting the task is completed
  let rowElement = $("input[name='canHelpTaskOption']:checked").parents("tr")

  let tmpStr = JSON.stringify({ taskId: taskIdSelected, userId: currentUser.id });
  console.log(tmpStr);


  // https://stackoverflow.com/questions/10857382/setting-the-post-body-to-a-json-object-with-jquery
  $.ajax({
    type: "POST",
    url: "/api/offertohelp",
    contentType: "application/json",
    data: tmpStr,
    success: function (data) {
      try {

        rowElement.removeItem();
        if (data.result != "error") {
        }
      }
      catch (e) {
        console.log(e);
      }
    },
    failure: function (errMsg) {
      alert(errMsg);
    }
  }).then(function () {

    if (!successCall) {
      // can't validate the address, and we already showed the user
      // a message in the failure case, so we can exit this function
      // and not create a new need until the user fixes the address
      alert("The address provided is not valid.");
      return;
    }
  });
}



// end of can help page handlers

$(window).load(() => { });

// The following function is called by JQuery only after all the DOM is ready
$(() => {
  // Get user location info:
  // This is how to allow the user to pick the location from the map, to assist entering the place they need help
  // https://developer.mapquest.com/documentation/mapquest-js/v1.3/examples/reverse-geocoding/
  // https://stackoverflow.com/questions/14074075/html5-geolocation-script-works-in-chrome-but-not-safari-or-any-ios6-browser
  // Should use this approach in the future: https://developers.google.com/web/fundamentals/native-hardware/user-location
  if (navigator.geolocation == undefined) {
    // location not supported. we can't show maps and relative location
    currentUser.locationSupport = true;
  } else if (navigator.geolocation != undefined) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        currentUser.latitude = position.coords.latitude;
        currentUser.longitude = position.coords.longitude;
        currentUser.locationSupport = true;

        const popup = L.popup();

        const map = L.mapquest.map('map', {
          center: [currentUser.latitude, currentUser.longitude],
          layers: L.mapquest.tileLayer('map'),
          zoom: 14,
        });

        L.marker([currentUser.latitude, currentUser.longitude], {
          icon: L.mapquest.icons.marker(),
          draggable: false,
        })
          .bindPopup('You are here')
          .addTo(map);
      },
      (error) => {
        console.log("Error=" + error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            break;
          case error.POSITION_UNAVAILABLE:
            break;
          case error.TIMEOUT:
            break;
          default:
            break;
        }
      },
    );
  }

  // Try reading the currentUser from localstorage
  // and redirects the page to use the querystring to pass
  // the userId
  const userStored = localStorage.getItem(userCookieName);
  console.log('currentValue retrieved:' + userStored);
  if (userStored) {
    currentUser = JSON.parse(userStored);
  }

  let currentURL = window.location.href;
  console.log(currentURL);

  const positionOfUserIdInUrl = currentURL.indexOf("?userId=");
  if (currentUser.loggedIn && currentUser.id > 0 && (positionOfUserIdInUrl < 0 || (positionOfUserIdInUrl + 9) != currentURL.length)) {
    currentUser = JSON.parse(userStored);
    if (currentUser.id > 0 && currentUser.loggedIn) {
      window.location.href = '/?userId=' + currentUser.id;
    }
  }

  console.log("-----------------------------------------------------------");
  console.log("adding event handlers");
  console.log("-----------------------------------------------------------");





  $('.need-form').on('submit', (event) => {
    // Make sure to preventDefault on a submit event.
    event.preventDefault();


    // our checks and logic goes next
    var errorMessage;
    if (!currentUser.loggedIn) {
      errorMessage = "You are not logged in! Please, click the Facebook login button and try again."
      alert(errorMessage);
      return;
    }

    console.log("submit need...");
    // https://www.tutorialrepublic.com/faq/how-to-get-the-value-of-selected-radio-button-using-jquery.php
    var needText = $("input[name='needTextOption']:checked").val();

    // https://www.tutorialrepublic.com/faq/how-to-get-the-value-in-an-input-text-box-using-jquery.php
    var needAddress1 = $("#needAddress1").val();
    var needAddress2 = $("#needAddress2").val();

    if (!needAddress1 && !needAddress2) {
      errorMessage = "You need to provide a valid address!";
      alert(errorMessage);
      return;
    }

    if (!needAddress1 && needAddress2) {
      // if one address was provided and in the address 2 input,
      // move it to address 1
      needAddress1 = needAddress2;
      needAddress2 = "";
    }

    // validate addresses provided

    var successCall = false;
    if (needAddress1) {
      let tmpObj = {
        location: needAddress1
      };

      console.log(tmpObj);
      let tmpStr = JSON.stringify(tmpObj);
      console.log(tmpStr);

      $.ajaxSetup({ async: false });
      // https://stackoverflow.com/questions/10857382/setting-the-post-body-to-a-json-object-with-jquery
      $.ajax({
        type: "POST",
        url: "/api/validateaddress",
        contentType: "application/json",
        data: tmpStr,
        success: function (data) {
          try {
            if (data.location != "error") {
              successCall = true;
              needAddress1 = data.location;
            }
          }
          catch (e) {
            console.log(e);
          }
        },
        failure: function (errMsg) {
          alert(errMsg);
        }
      }).then(function () {
        $.ajaxSetup({ async: true });
        if (!successCall) {
          // can't validate the address, and we already showed the user
          // a message in the failure case, so we can exit this function
          // and not create a new need until the user fixes the address
          alert("The address provided is not valid.");
          return;
        }
      });
    }

    if (needAddress1 && !successCall) {
      return;
    }

    // validate now the address2
    successCall = false;
    if (needAddress2) {
      let tmpObj = {
        location: needAddress2
      };

      let tmpStr = JSON.stringify(tmpObj);
      $.ajaxSetup({ async: false });
      // https://stackoverflow.com/questions/10857382/setting-the-post-body-to-a-json-object-with-jquery
      $.ajax({
        type: "POST",
        url: "/api/validateaddress",
        contentType: "application/json",
        data: tmpStr,
        success: function (data) {
          try {
            console.log(data);
            if (data.location != "error") {
              successCall = true;
              needAddress2 = data.location;
            }
          }
          catch (e) {
            console.log(e);
          }
        },
        failure: function (errMsg) {
          alert(errMsg);
        }
      }).then(function () {
        $.ajaxSetup({ async: true });
        if (!successCall) {
          // can't validate the address, and we already showed the user
          // a message in the failure case, so we can exit this function
          // and not create a new need until the user fixes the address
          alert("The address provided is not valid.");
          return;
        }
      });
    }

    if (needAddress2 && !successCall) {
      return;
    }

    const newNeed = {
      task_text: needText,
      task_type_id: 1,
      person_id: currentUser.id,
      location_start: needAddress1,
      location_end: needAddress2
    };

    console.log(newNeed);

    // Send the POST request.
    $.ajax({
      type: "POST",
      url: "/api/addneed",
      contentType: "application/json",
      data: JSON.stringify(newNeed),
      success: function (data) {
        try {
          console.log(data);
        }
        catch (e) {
          console.log(e);
        }
      },
      failure: function (errMsg) {
        alert(errMsg);
      }
    }).then((res) => {
      console.log('created new task');
      alert("Your help request was created!");
      window.history.back();
    });
  });
});
