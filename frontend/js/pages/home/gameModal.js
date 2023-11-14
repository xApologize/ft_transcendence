class GameModal {
    constructor(modalId) {
      this.modal = new bootstrap.Modal(document.getElementById(modalId));
      this.fullHeader = document.getElementById('full-header');
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
  
    removeCloseButton() {
      const closeBtn = this.modal._element.querySelector('.close');
      if (closeBtn) {
        document.getElementById('full-header').removeChild(closeBtn);
      }
    }

    hideTitle() {
      this.fullHeader.style.display = 'none';
    }

    showTitle() {
      this.fullHeader.style.display = '';
    }
  }

  export default GameModal;