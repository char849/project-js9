document.querySelector('#top').addEventListener('click', item =>{    
    document.body.scrollTop = 0
    document.documentElement.scrollTop = 0
  })

  window.addEventListener('scroll', () => {
      let topShow = false
      if(window.scrollY === 0){
          document.querySelector('#top').classList.remove('isShow')
          topShow = false          
      } else {
        if (!topShow)document.querySelector('#top').classList.add('isShow')
      }
  })
   