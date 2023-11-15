class GameModal {
    constructor(modalId) {
      this.modal = new bootstrap.Modal(document.getElementById(modalId), {
        animate: false,     // Disable modal animation
        backdrop: 'static', // Prevent closing by clicking on the backdrop
        keyboard: false,    // Disable closing with the escape key
        scrollable: false,  // Prevent page scrolling when modal is open
      });
      this.modalID = modalId;
      // this.fullHeader = document.getElementById('full-header');
      // this.closeButton = document.getElementById('closeButtonModal/');
      
    }
    show() {
      this.modal.show();
    }
  
    hide() {
      this.modal.hide();
    }
  
    setBackdrop(backdrop) {
      this.modal._config.backdrop = backdrop;
    }
  
    hideCloseButton() {
      this.closeButton.style.display = 'none'
    }

    showCloseButton() {
      this.closeButton.style.display = ''
    }

    hideTitle() {
      this.fullHeader.style.display = 'none';
    }

    showTitle() {
      this.fullHeader.style.display = '';
    }
  }

  export default GameModal;