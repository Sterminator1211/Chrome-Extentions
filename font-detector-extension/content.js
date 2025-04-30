document.addEventListener('mouseup', function () {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
  
    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const parentElement = range.startContainer.parentElement;
  
      const fontFamily = window.getComputedStyle(parentElement).fontFamily;
  
      // Remove any existing popup
      const existingPopup = document.getElementById('font-detector-popup');
      if (existingPopup) {
        existingPopup.remove();
      }
  
      const popup = document.createElement('div');
      popup.id = 'font-detector-popup';
      popup.innerText = `Font: ${fontFamily}`;
      popup.className = 'font-detector-popup';
  
      document.body.appendChild(popup);
  
      const rect = range.getBoundingClientRect();
      popup.style.top = `${rect.top + window.scrollY - 40}px`;
      popup.style.left = `${rect.left + window.scrollX}px`;
  
      // Remove popup after 3 seconds
      setTimeout(() => popup.remove(), 6000);
    }
  });
  