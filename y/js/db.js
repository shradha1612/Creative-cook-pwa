//offline data
db.enablePersistence()
.catch(err =>{
    if(err.code == 'failed-precondition'){
        //probably multiple tabs opened at once
        console.log('persistence failed');
    }else if(err.code =='unimplemented'){
        //lack of browser support
        console.log('persistence is not available');
    }
});

//real time listener
db.collection('recipes').onSnapshot((snapshot)=>{
    //console.log(snapshot.docChanges());
     snapshot.docChanges().forEach(change =>{
        // console.log(change,change.doc.data(),change.doc.id);
        if(change.type==='added'){
            //add doc data to webpage
            renderRecipe(change.doc.data(),change.doc.id);
        }
        if(change.type==='removed'){
            //remove the documnet data from web page
            removeRecipe(change.doc.id);
        }
     });
})

//add new recipes
const form = document.querySelector('form');
form.addEventListener('submit',evt =>{
    evt.preventDefault();
    const recipe={
        title:form.title.value,
        ingredients:form.ingredients.value
    };
    db.collection('recipes').add(recipe)
    .catch(err => console.log(err));

        form.title.value='';
        form.ingredients.value='';
});


//delete a receipe
const recipeContainer = document.querySelector('.recipes');
recipeContainer.addEventListener('click', evt =>{
    console.log(evt);
    if(evt.target.tagName ==='I'){
        const id = evt.target.getAttribute('data-id');
        db.collection('recipes').doc(id).delete()
    }
});



