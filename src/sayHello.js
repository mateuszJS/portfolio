const sayHello = () => {
  if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
      window.console.log(
          "\n\n\n%c  %c Hi, I'm Mateusz! \n%c  %c Welcome to my portfolio! \n%c  %c If you have any technical question, ask me. \n%c  %c mate.walendzik@gmail.com \n\n\n",
          'background: #22ff77; padding:5px 0;',
          'color: #22ff77; background: #09124f; padding:5px 0;',
          'background: #22ff77; padding:5px 0;',
          'color: #22ff77; background: #09124f; padding:5px 0;',
          'background: #22ff77; padding:5px 0;',
          'color: #22ff77; background: #09124f; padding:5px 0;',
          'background: #22ff77; padding:5px 0;',
          'color: #22ff77; background: #09124f; padding:5px 0;',
      );
  }
  else if (window.console) {
      window.console.log("Hi, I'm Mateusz! Welcome to my portfolio! If you have any technical question, ask me. mate.walendzik@gmail.com");
  }
  window.console.log_temp = window.console.log;
  window.console.log = function(){};
}

export default sayHello;
