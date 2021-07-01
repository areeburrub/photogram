// Authentication Part Start here
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

loginBtn.onclick = () => auth.signInWithPopup(provider);
logoutBtn.onclick = () => auth.signOut();

const userSection = document.getElementById('userSection');
const userNav = document.getElementById('userNav');
const userPic = document.getElementById('userPic');
const displayName = document.getElementById('displayName');

auth.onAuthStateChanged(user=>{
    if(user){
        loginBtn.hidden = true;
        userNav.hidden = false;
        displayName.innerText = user.displayName;
        userPic.src = user.photoURL;
        

    }

    else{
        loginBtn.hidden = false;
        userSection.hidden = true;
        userNav.hidden = true;
    }
})


// Get file from user
const upPhoto = document.getElementById('upPhoto');
const upImg = document.getElementById('upImg');

upPhoto.onchange = () => {
    var input = upPhoto;
    var url = upPhoto.value;
    var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();
    if (input.files && input.files[0]&& (ext == "gif" || ext == "png" || ext == "jpeg" || ext == "jpg")) 
     {
        var reader = new FileReader();

        reader.onload = (e) => {
           upImg.style = `background:url(${e.target.result}) center center no-repeat, #a1cbe7`;
        }
       reader.readAsDataURL(input.files[0]);
    }
  }


// Poupfunction
const closeBtn  = document.getElementById('closePopup');
const createBtn  = document.getElementById('createBtn');
const createPopup = document.getElementById('popup');

closeBtn.onclick = () => {
    createPopup.hidden=true;
}

createBtn.onclick = () => {
    createPopup.hidden=false;
    console.log('popup');
}

// Uploading Photo to File Storage

const uploadBtn = document.getElementById('uploadBtn');
const headingPhoto = document.getElementById('headingPhoto');

const storage = firebase.storage();


uploadBtn.onclick = () => {
    var file = upPhoto.files[0];
    const fileRef = storage.ref('posts/' +makeid(6)+'-'+file.name)
    var task = fileRef.put(file);
    task.on('state_changed', 
        (snapshot) => {
            // Observe state change events such as progress, pause, and resume
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            const upProgress = document.getElementById('upProgress');
            upProgress.style.width = progress + '%';
        }, 
        (error) => {
        // Handle unsuccessful uploads
        }, 
        () => {
        // Handle successful uploads on complete
        task.snapshot.ref.getDownloadURL().then((downloadURL) => {
            updateDatabase(downloadURL, firebase.auth().currentUser);
            upPhoto.value = ''
            headingPhoto.value = ''
           upImg.style = `background:url(./success.gif) center center no-repeat`;

        });
        }
    );
}

// Update Database Function
const db = firebase.firestore();
const dbRef = db.collection('posts');
const updateDatabase = (link,user) => {
 let post = {
     postid : makeid(7),
     heading:headingPhoto.value,
     By : user.displayName,
     uid : user.uid,
     img : link,
     time : firebase.firestore.FieldValue.serverTimestamp()
 }
 dbRef.add(post)
}


//  Make ID function, I use this to create random ID
// credit : https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const makeid = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}


// Updating DOM with posts
const photoContainer = document.getElementById('photo-container');


var allfeedStatus = false;
var userfeedStatus = false;

// sub all will subscribe to all feed
subAll = () => {
    
    if(allfeedStatus == false){
        allfeed = dbRef.onSnapshot((querySnapshot) => {
            photoContainer.innerHTML = ''
            querySnapshot.forEach((doc) => {
                drawPhotos(doc.data().img,doc.data().By,doc.data().heading);
            });
        });
        allfeedStatus = true;
        userSection.hidden = true;
    }
    
    if(userfeedStatus){
        userfeed();
        userfeedStatus = false;
    }
    
}


// sub profile will subscribe to the profile feed
subProfile = () => {
    if(userfeedStatus == false){
        userfeed = dbRef.where('uid','==',auth.currentUser.uid).onSnapshot((querySnapshot) => {
            photoContainer.innerHTML = ''
            querySnapshot.forEach((doc) => {
                drawPhotos(doc.data().img,doc.data().By,doc.data().heading);
            });
        }); 
        userSection.hidden = false;
        userfeedStatus = true;
    }

    if(allfeedStatus == true){
        allfeed();
        allfeedStatus = false;
    }
}

subAll();

//Draw post function will draw the post cards
drawPhotos = (link,user,heading) => {
    photo = `
    <div class="photo">
        <h4>${heading}</h4>
        <div class="img" style="background:url(${link}) center center no-repeat , #a1cbe7; background-size: cover;"></div>
        <h6>by: ${user}</h6>
    </div>
    `
    photoContainer.innerHTML += photo;
}

document.getElementById('allFeed').onclick = () => subAll();
document.getElementById('profileFeed').onclick = () => subProfile();