export const html = `<script>
  window.addEventListener('message', (e) => {
    if (e.data.command === 'loadingStep') { render(e.data); }
  });
</script>`;