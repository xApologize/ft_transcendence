class GameModal {
    constructor(modalId) {
      this.modal = new bootstrap.Modal(document.getElementById(modalId));
      this.fullHeader = document.getElementById('full-header');
      this.closeButton = document.getElementById('closeButtonModal')
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