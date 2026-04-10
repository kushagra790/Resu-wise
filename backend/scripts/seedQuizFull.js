const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('../models/Question');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resuwise';

const allQuestions = [
  // ───── SQL ─────
  { category:'SQL', question:'What does SQL stand for?', answers:{answer_a:'Structured Query Language',answer_b:'Simple Question Language',answer_c:'Standard Query Library',answer_d:'Stored Query Language'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'SQL', question:'Which command removes a table in SQL?', answers:{answer_a:'DELETE TABLE',answer_b:'DROP TABLE',answer_c:'REMOVE TABLE',answer_d:'ERASE TABLE'}, correct_answer:'answer_b', difficulty:'easy' },
  { category:'SQL', question:'Which SQL keyword is used to sort results?', answers:{answer_a:'SORT',answer_b:'ORDER BY',answer_c:'ARRANGE',answer_d:'GROUP'}, correct_answer:'answer_b', difficulty:'easy' },
  { category:'SQL', question:'What does PRIMARY KEY do?', answers:{answer_a:'Uniquely identifies each record',answer_b:'Creates a backup',answer_c:'Encrypts data',answer_d:'Deletes duplicates'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'SQL', question:'What is a JOIN in SQL?', answers:{answer_a:'Combines rows from two or more tables',answer_b:'Deletes rows',answer_c:'Creates a new table',answer_d:'Sorts data'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'SQL', question:'What does GROUP BY do?', answers:{answer_a:'Groups rows sharing a property',answer_b:'Sorts rows',answer_c:'Filters rows',answer_d:'Joins tables'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'SQL', question:'Which constraint ensures a column has no duplicate values?', answers:{answer_a:'NOT NULL',answer_b:'UNIQUE',answer_c:'PRIMARY',answer_d:'CHECK'}, correct_answer:'answer_b', difficulty:'easy' },
  { category:'SQL', question:'What is a FOREIGN KEY?', answers:{answer_a:'References primary key in another table',answer_b:'Encrypts a column',answer_c:'Sorts a column',answer_d:'Indexes a column'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'SQL', question:'What does HAVING clause do?', answers:{answer_a:'Filters groups after GROUP BY',answer_b:'Filters rows before grouping',answer_c:'Joins tables',answer_d:'Orders results'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'SQL', question:'What is a subquery?', answers:{answer_a:'A query inside another query',answer_b:'A backup query',answer_c:'A stored procedure',answer_d:'An index query'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── CODE ─────
  { category:'CODE', question:'What is the purpose of a variable?', answers:{answer_a:'To store data values',answer_b:'To create loops',answer_c:'To define functions',answer_d:'To compile code'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'CODE', question:'What is a function?', answers:{answer_a:'A reusable block of code',answer_b:'A data type',answer_c:'A loop construct',answer_d:'A variable'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'CODE', question:'What does DRY stand for?', answers:{answer_a:"Don't Repeat Yourself",answer_b:'Data Retrieval Yield',answer_c:'Direct Resource Yielding',answer_d:'Dynamic Runtime Yielding'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CODE', question:'What is recursion?', answers:{answer_a:'A function that calls itself',answer_b:'A loop that repeats',answer_c:'A conditional statement',answer_d:'A type of variable'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CODE', question:'What is an array?', answers:{answer_a:'A collection of elements of the same type',answer_b:'A single value',answer_c:'A function parameter',answer_d:'A loop statement'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'CODE', question:'What is OOP?', answers:{answer_a:'Object-Oriented Programming',answer_b:'Open Operational Protocol',answer_c:'Ordered Output Process',answer_d:'Object Output Programming'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'CODE', question:'What is inheritance in OOP?', answers:{answer_a:'A class inheriting properties from another class',answer_b:'Copying a function',answer_c:'Importing a library',answer_d:'Deleting a variable'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CODE', question:'What is polymorphism?', answers:{answer_a:'Same interface, different implementations',answer_b:'Multiple inheritance',answer_c:'Static typing',answer_d:'Dynamic memory'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CODE', question:'What is a stack overflow?', answers:{answer_a:'When the call stack exceeds its limit (usually infinite recursion)',answer_b:'A website for developers',answer_c:'A memory allocation error',answer_d:'A loop termination'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CODE', question:'What is Big O notation?', answers:{answer_a:'Describes algorithm time/space complexity',answer_b:'A programming language',answer_c:'A data structure',answer_d:'A design pattern'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── REACT ─────
  { category:'REACT', question:'What is React?', answers:{answer_a:'A JavaScript library for building user interfaces',answer_b:'A database system',answer_c:'A backend framework',answer_d:'A CSS preprocessor'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'REACT', question:'What is JSX?', answers:{answer_a:'JavaScript XML — syntax extension for React',answer_b:'Java Source eXtension',answer_c:'JavaScript Extension',answer_d:'JSON Extension'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'REACT', question:'Which hook manages state in functional components?', answers:{answer_a:'useEffect',answer_b:'useState',answer_c:'useContext',answer_d:'useCallback'}, correct_answer:'answer_b', difficulty:'medium' },
  { category:'REACT', question:'What does useEffect do?', answers:{answer_a:'Manages component state',answer_b:'Performs side effects in functional components',answer_c:'Creates custom hooks',answer_d:'Optimizes performance'}, correct_answer:'answer_b', difficulty:'medium' },
  { category:'REACT', question:'What is the Virtual DOM?', answers:{answer_a:'A lightweight copy of the real DOM for diffing',answer_b:'A browser feature',answer_c:'A CSS rendering method',answer_d:'A JavaScript engine'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'REACT', question:'What is a React key prop used for?', answers:{answer_a:'Uniquely identify list items for reconciliation',answer_b:'Styling elements',answer_c:'Event handling',answer_d:'State management'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'REACT', question:'What is React Context?', answers:{answer_a:'A way to share data without passing props at every level',answer_b:'A styling approach',answer_c:'A routing library',answer_d:'A state machine'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'REACT', question:'What is React Router used for?', answers:{answer_a:'Client-side navigation/routing',answer_b:'State management',answer_c:'Data fetching',answer_d:'Styling components'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'REACT', question:'What does lifting state up mean?', answers:{answer_a:'Moving state to a common ancestor component',answer_b:'Making state global',answer_c:'Using Redux',answer_d:'Server-side state'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'REACT', question:'What is a controlled component?', answers:{answer_a:'A component whose form data is handled by React state',answer_b:'A component with no props',answer_c:'A component with side effects',answer_d:'A component using refs'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── NODEJS ─────
  { category:'NODEJS', question:'What is Node.js?', answers:{answer_a:'A JavaScript runtime for server-side development',answer_b:'A frontend framework',answer_c:'A database system',answer_d:'A CSS tool'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'NODEJS', question:'What is npm?', answers:{answer_a:'Node Package Manager',answer_b:'New Programming Module',answer_c:'Node Project Manager',answer_d:'Network Package Manager'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'NODEJS', question:'What is Express.js?', answers:{answer_a:'A web application framework for Node.js',answer_b:'A database library',answer_c:'A testing framework',answer_d:'A CSS framework'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'NODEJS', question:'What is middleware in Express?', answers:{answer_a:'Function with access to request and response objects',answer_b:'A database query tool',answer_c:'A frontend library',answer_d:'A CSS preprocessor'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'NODEJS', question:'What is the event loop in Node.js?', answers:{answer_a:'Mechanism that handles async operations non-blockingly',answer_b:'A for loop for events',answer_c:'A DOM event handler',answer_d:'A loop for file reading'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'NODEJS', question:'What does require() do in Node.js?', answers:{answer_a:'Imports modules',answer_b:'Creates a server',answer_c:'Reads files',answer_d:'Runs scripts'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'NODEJS', question:'What is a callback in Node.js?', answers:{answer_a:'A function passed as argument to be called later',answer_b:'A return statement',answer_c:'A module export',answer_d:'A loop control'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'NODEJS', question:'What is async/await in Node.js?', answers:{answer_a:'Syntax to handle promises more cleanly',answer_b:'A scheduling mechanism',answer_c:'A file system API',answer_d:'A networking library'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── DOCKER ─────
  { category:'DOCKER', question:'What is Docker?', answers:{answer_a:'A containerization platform',answer_b:'A programming language',answer_c:'A web browser',answer_d:'A database'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'DOCKER', question:'What is a Docker image?', answers:{answer_a:'A read-only template to create containers',answer_b:'A running container',answer_c:'A Docker registry',answer_d:'A Dockerfile'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DOCKER', question:'What is a Dockerfile?', answers:{answer_a:'Text file with instructions to build an image',answer_b:'A configuration file',answer_c:'A container template',answer_d:'A Docker registry'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'DOCKER', question:'What command builds a Docker image?', answers:{answer_a:'docker build',answer_b:'docker create',answer_c:'docker make',answer_d:'docker compile'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DOCKER', question:'What is Docker Hub?', answers:{answer_a:'A cloud-based registry for Docker images',answer_b:'A Docker documentation site',answer_c:'A Docker development tool',answer_d:'A Docker configuration utility'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'DOCKER', question:'What does docker-compose do?', answers:{answer_a:'Defines and runs multi-container Docker apps',answer_b:'Builds a single image',answer_c:'Monitors container health',answer_d:'Pushes images to registry'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DOCKER', question:'What is a Docker volume?', answers:{answer_a:'Persistent data storage for containers',answer_b:'A container size limit',answer_c:'A network setting',answer_d:'A build artifact'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── NEXT.JS ─────
  { category:'NEXT.JS', question:'What is Next.js?', answers:{answer_a:'A React framework for production',answer_b:'A JavaScript library',answer_c:'A CSS framework',answer_d:'A database system'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'NEXT.JS', question:'What is SSR in Next.js?', answers:{answer_a:'Server-Side Rendering — pages rendered on server per request',answer_b:'Static Site Rendering',answer_c:'Simple Script Runtime',answer_d:'Secure Server Route'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'NEXT.JS', question:'What is Static Generation in Next.js?', answers:{answer_a:'Building pages at build time',answer_b:'Building pages on each request',answer_c:'Caching pages in memory',answer_d:'Compiling JSX'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'NEXT.JS', question:'What is the App Router in Next.js 13+?', answers:{answer_a:'File-based routing using the app directory',answer_b:'A separate routing library',answer_c:'A React Router wrapper',answer_d:'An Express.js integration'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'NEXT.JS', question:'What is getServerSideProps?', answers:{answer_a:'A function to fetch data server-side on every request',answer_b:'A client-side data hook',answer_c:'A static data function',answer_d:'A build-time function'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── POSTGRES ─────
  { category:'POSTGRES', question:'What is PostgreSQL?', answers:{answer_a:'An open-source relational database system',answer_b:'A NoSQL database',answer_c:'A web server',answer_d:'A programming language'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'POSTGRES', question:'What is ACID?', answers:{answer_a:'Atomicity, Consistency, Isolation, Durability',answer_b:'Active Cache Index Database',answer_c:'Automatic Commit Integrity Design',answer_d:'Access Control Index Descriptor'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'POSTGRES', question:'What is an INDEX?', answers:{answer_a:'A data structure to speed up queries',answer_b:'A list of all tables',answer_c:'A backup system',answer_d:'A transaction log'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'POSTGRES', question:'What is a transaction in PostgreSQL?', answers:{answer_a:'A sequence of operations treated as a single unit',answer_b:'A data type',answer_c:'A trigger function',answer_d:'A view'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'POSTGRES', question:'What is a VIEW in PostgreSQL?', answers:{answer_a:'A virtual table based on a query result',answer_b:'A backup table',answer_c:'A physical table copy',answer_d:'A database log'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── DJANGO ─────
  { category:'DJANGO', question:'What is Django?', answers:{answer_a:'A Python web framework',answer_b:'A JavaScript library',answer_c:'A database system',answer_d:'A CSS framework'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'DJANGO', question:'What is Django ORM?', answers:{answer_a:'Object-Relational Mapping — interact with DB using Python',answer_b:'Operational Resource Manager',answer_c:'Online Repository Manager',answer_d:'Object Request Manager'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DJANGO', question:'What is the MTV pattern?', answers:{answer_a:'Model-Template-View',answer_b:'Model-Test-View',answer_c:'Module-Template-Validator',answer_d:'Memory-Token-Variable'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DJANGO', question:'What is Django Admin?', answers:{answer_a:'An auto-generated admin interface',answer_b:'A database tool',answer_c:'A security feature',answer_d:'A testing framework'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'DJANGO', question:'What is a Django migration?', answers:{answer_a:'Propagating model changes to the database schema',answer_b:'Moving servers',answer_c:'Copying files',answer_d:'Upgrading Django'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DJANGO', question:'What is Django REST Framework?', answers:{answer_a:'A toolkit for building Web APIs with Django',answer_b:'A frontend framework',answer_c:'A database driver',answer_d:'A testing library'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── VUEJS ─────
  { category:'VUEJS', question:'What is Vue.js?', answers:{answer_a:'A progressive JavaScript framework',answer_b:'A CSS framework',answer_c:'A database system',answer_d:'A server framework'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'VUEJS', question:'What is reactive data in Vue?', answers:{answer_a:'Data that auto-updates the UI when changed',answer_b:'Data stored in a DB',answer_c:'Data from server',answer_d:'Data in local storage'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'VUEJS', question:'What is v-bind in Vue?', answers:{answer_a:'Directive to bind data to attributes',answer_b:'A loop directive',answer_c:'A conditional directive',answer_d:'An event directive'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'VUEJS', question:'What is Vuex?', answers:{answer_a:'State management library for Vue',answer_b:'A Vue CSS framework',answer_c:'A Vue router',answer_d:'A Vue testing tool'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'VUEJS', question:'What is the Vue Composition API?', answers:{answer_a:'A function-based way to organize component logic',answer_b:'A way to compose CSS',answer_c:'A component registry',answer_d:'A Vue plugin system'}, correct_answer:'answer_a', difficulty:'hard' },

  // ───── LINUX ─────
  { category:'LINUX', question:'What is Linux?', answers:{answer_a:'An open-source operating system kernel',answer_b:'A programming language',answer_c:'A web browser',answer_d:'A database'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'LINUX', question:'What is chmod used for?', answers:{answer_a:'Changing file permissions',answer_b:'Creating directories',answer_c:'Compressing files',answer_d:'Copying files'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'LINUX', question:'What does sudo do?', answers:{answer_a:'Executes commands with superuser privileges',answer_b:'Creates a new user',answer_c:'Lists directories',answer_d:'Removes files'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'LINUX', question:'What is the ls command?', answers:{answer_a:'Lists directory contents',answer_b:'Creates files',answer_c:'Removes directories',answer_d:'Changes permissions'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'LINUX', question:'What does grep do?', answers:{answer_a:'Searches for patterns in files',answer_b:'Creates directories',answer_c:'Removes files',answer_d:'Copies files'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'LINUX', question:'What is a symbolic link?', answers:{answer_a:'A reference/shortcut to another file or directory',answer_b:'A compressed file',answer_c:'A file permission',answer_d:'A hidden file'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'LINUX', question:'What does ps aux show?', answers:{answer_a:'All currently running processes',answer_b:'Disk usage',answer_c:'Network connections',answer_d:'Memory info'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── BASH ─────
  { category:'BASH', question:'What is Bash?', answers:{answer_a:'A Unix shell and command language',answer_b:'A programming language',answer_c:'A database system',answer_d:'A web server'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'BASH', question:'What does the pipe (|) do?', answers:{answer_a:'Passes output of one command to another',answer_b:'Creates a file',answer_c:'Lists files',answer_d:'Changes directory'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'BASH', question:'What does grep do?', answers:{answer_a:'Searches for patterns in files',answer_b:'Creates directories',answer_c:'Removes files',answer_d:'Copies files'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'BASH', question:'What is a shell variable?', answers:{answer_a:'A named storage location in the shell',answer_b:'A shell command',answer_c:'A file path',answer_d:'A network setting'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'BASH', question:'What does chmod +x do?', answers:{answer_a:'Makes a file executable',answer_b:'Deletes a file',answer_c:'Copies a file',answer_d:'Moves a file'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── DEVOPS ─────
  { category:'DEVOPS', question:'What is DevOps?', answers:{answer_a:'Culture combining development and operations',answer_b:'A programming language',answer_c:'A database system',answer_d:'A web framework'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'DEVOPS', question:'What is CI/CD?', answers:{answer_a:'Continuous Integration and Continuous Deployment',answer_b:'Code Integration and Database',answer_c:'Configuration and Deployment',answer_d:'Compile and Deploy'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DEVOPS', question:'What is Kubernetes?', answers:{answer_a:'An orchestration platform for containerized apps',answer_b:'A programming language',answer_c:'A web server',answer_d:'A database system'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DEVOPS', question:'What is Infrastructure as Code?', answers:{answer_a:'Managing infrastructure using code and automation',answer_b:'Writing code on the server',answer_c:'Encoding infrastructure docs',answer_d:'A backup method'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DEVOPS', question:'What is Jenkins?', answers:{answer_a:'An open-source automation server for CI/CD',answer_b:'A database system',answer_c:'A web framework',answer_d:'A container registry'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DEVOPS', question:'What is Terraform?', answers:{answer_a:'An IaC tool to provision cloud infrastructure',answer_b:'A container runtime',answer_c:'A monitoring tool',answer_d:'A testing framework'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── WORDPRESS ─────
  { category:'WORDPRESS', question:'What is WordPress?', answers:{answer_a:'An open-source content management system',answer_b:'A programming language',answer_c:'A web server',answer_d:'A database system'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'WORDPRESS', question:'What is a WordPress theme?', answers:{answer_a:'Files that define site appearance',answer_b:'A plugin',answer_c:'A database template',answer_d:'A user role'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'WORDPRESS', question:'What is a WordPress plugin?', answers:{answer_a:'Software that extends WordPress functionality',answer_b:'A theme file',answer_c:'A template system',answer_d:'A database table'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'WORDPRESS', question:'What is the WordPress REST API?', answers:{answer_a:'An interface to interact with WordPress data via HTTP',answer_b:'A backup system',answer_c:'A theme editor',answer_d:'A admin panel feature'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'WORDPRESS', question:'What is WooCommerce?', answers:{answer_a:'A WordPress e-commerce plugin',answer_b:'A separate CMS',answer_c:'A payment gateway',answer_d:'A database plugin'}, correct_answer:'answer_a', difficulty:'easy' },

  // ───── PYTHON ─────
  { category:'PYTHON', question:'What is Python?', answers:{answer_a:'A high-level, interpreted programming language',answer_b:'A compiled language',answer_c:'A database language',answer_d:'A frontend framework'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'PYTHON', question:'What are Python list comprehensions?', answers:{answer_a:'A concise way to create lists',answer_b:'A loop construct',answer_c:'A function decorator',answer_d:'A class method'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'PYTHON', question:'What is a Python decorator?', answers:{answer_a:'A function that modifies another function',answer_b:'A CSS-like styling feature',answer_c:'A class attribute',answer_d:'A module importer'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'PYTHON', question:'What is a Python generator?', answers:{answer_a:'A function that yields values one at a time',answer_b:'A random number tool',answer_c:'A code generator',answer_d:'A class factory'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'PYTHON', question:'What does pip do?', answers:{answer_a:'Installs Python packages',answer_b:'Compiles Python code',answer_c:'Runs Python scripts',answer_d:'Debugs Python programs'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'PYTHON', question:'What is __init__.py?', answers:{answer_a:'Marks a directory as a Python package',answer_b:'The main entry point',answer_c:'A configuration file',answer_d:'A test file'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'PYTHON', question:'What is the GIL in Python?', answers:{answer_a:'Global Interpreter Lock — prevents true multi-threading',answer_b:'Global Import Library',answer_c:'Garbage Inspector Library',answer_d:'General Interface Layer'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'PYTHON', question:'What is exception handling in Python?', answers:{answer_a:'try/except blocks to handle runtime errors',answer_b:'Catching bugs at compile time',answer_c:'A debugging tool',answer_d:'A logging library'}, correct_answer:'answer_a', difficulty:'easy' },

  // ───── JAVA ─────
  { category:'JAVA', question:'What is Java?', answers:{answer_a:'An object-oriented, platform-independent language',answer_b:'A scripting language',answer_c:'A CSS preprocessor',answer_d:'A database language'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'JAVA', question:'What is the JVM?', answers:{answer_a:'Java Virtual Machine — runs Java bytecode',answer_b:'Java Variable Manager',answer_c:'Java Version Manager',answer_d:'Java Validation Module'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'JAVA', question:'What is a Java interface?', answers:{answer_a:'A contract defining methods a class must implement',answer_b:'A user interface component',answer_c:'A Java IO class',answer_d:'A database connector'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'JAVA', question:'What is Java garbage collection?', answers:{answer_a:'Automatic memory management that frees unused objects',answer_b:'A file deletion tool',answer_c:'A code cleanup feature',answer_d:'A build tool'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'JAVA', question:'What is a Java Stream?', answers:{answer_a:'A pipeline for processing collections of data',answer_b:'A network stream',answer_c:'A file reader',answer_d:'A parallel loop'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'JAVA', question:'What is Maven?', answers:{answer_a:'A build automation and dependency management tool',answer_b:'A Java IDE',answer_c:'A testing framework',answer_d:'A web server'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'JAVA', question:'What is Spring Boot?', answers:{answer_a:'A framework for building Java-based applications quickly',answer_b:'A testing library',answer_c:'A Java IDE plugin',answer_d:'A database ORM'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'JAVA', question:'What is the difference between == and .equals() in Java?', answers:{answer_a:'== compares references; .equals() compares values',answer_b:'They are identical',answer_c:'== compares values; .equals() compares references',answer_d:'== is for primitives only'}, correct_answer:'answer_a', difficulty:'hard' },

  // ───── JAVASCRIPT ─────
  { category:'JAVASCRIPT', question:'What is JavaScript?', answers:{answer_a:'A scripting language for the web',answer_b:'A compiled language',answer_c:'A database',answer_d:'A markup language'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'JAVASCRIPT', question:'What is a closure in JavaScript?', answers:{answer_a:'A function that remembers its outer scope variables',answer_b:'A way to close a window',answer_c:'A loop terminator',answer_d:'A try-catch block'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'JAVASCRIPT', question:'What is the difference between let, const and var?', answers:{answer_a:'let/const are block-scoped; var is function-scoped',answer_b:'They are identical',answer_c:'const can be reassigned',answer_d:'var is not supported in ES6'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'JAVASCRIPT', question:'What is a Promise?', answers:{answer_a:'An object representing eventual completion or failure of an async operation',answer_b:'A guarantee in code',answer_c:'A callback function',answer_d:'A synchronous function'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'JAVASCRIPT', question:'What does typeof return?', answers:{answer_a:'A string indicating the type of the value',answer_b:'A boolean',answer_c:'An integer type code',answer_d:'A class name'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'JAVASCRIPT', question:'What is event bubbling?', answers:{answer_a:'Events propagate from child to parent elements',answer_b:'Events trigger only on the target',answer_c:'Events loop infinitely',answer_d:'Events are queued'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'JAVASCRIPT', question:'What is the DOM?', answers:{answer_a:'Document Object Model — tree representation of an HTML page',answer_b:'Data Object Manager',answer_c:'Dynamic Object Method',answer_d:'Declared Object Map'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'JAVASCRIPT', question:'What is hoisting in JavaScript?', answers:{answer_a:'Variable/function declarations moved to top of scope',answer_b:'Loading assets before render',answer_c:'Moving code to server',answer_d:'A CSS animation'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── DATA STRUCTURES ─────
  { category:'DSA', question:'What is a linked list?', answers:{answer_a:'A sequence of nodes where each node points to the next',answer_b:'A type of array',answer_c:'A hash map',answer_d:'A tree structure'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'DSA', question:'What is a stack?', answers:{answer_a:'A LIFO data structure (Last In, First Out)',answer_b:'A FIFO data structure',answer_c:'A sorted array',answer_d:'A hash map'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'DSA', question:'What is a queue?', answers:{answer_a:'A FIFO data structure (First In, First Out)',answer_b:'A LIFO data structure',answer_c:'A binary tree',answer_d:'A graph'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'DSA', question:'What is a binary search tree?', answers:{answer_a:'A tree where left child < parent < right child',answer_b:'A tree with only two nodes',answer_c:'A balanced tree',answer_d:'A hash tree'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DSA', question:'What is time complexity of binary search?', answers:{answer_a:'O(log n)',answer_b:'O(n)',answer_c:'O(n²)',answer_d:'O(1)'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DSA', question:'What is a hash table?', answers:{answer_a:'A structure that maps keys to values using a hash function',answer_b:'A sorted list',answer_c:'A type of queue',answer_d:'A binary tree'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DSA', question:'What is DFS?', answers:{answer_a:'Depth-First Search — explores as deep as possible before backtracking',answer_b:'Data File System',answer_c:'Directory File Search',answer_d:'Dynamic First Search'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DSA', question:'What is BFS?', answers:{answer_a:'Breadth-First Search — explores neighbors level by level',answer_b:'Binary File Search',answer_c:'Backward File Scan',answer_d:'Block First Search'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'DSA', question:'What is a heap?', answers:{answer_a:'A complete binary tree with heap property (min or max)',answer_b:'Memory allocation area',answer_c:'A stack overflow',answer_d:'A dynamic array'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'DSA', question:'What is the time complexity of QuickSort on average?', answers:{answer_a:'O(n log n)',answer_b:'O(n²)',answer_c:'O(n)',answer_d:'O(log n)'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── MACHINE LEARNING ─────
  { category:'ML', question:'What is Machine Learning?', answers:{answer_a:'Systems learning patterns from data without explicit programming',answer_b:'A programming language',answer_c:'A database technology',answer_d:'A web framework'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'ML', question:'What is supervised learning?', answers:{answer_a:'Learning from labeled training data',answer_b:'Learning without any data',answer_c:'Learning from unlabeled data',answer_d:'Reinforcement learning'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'ML', question:'What is overfitting?', answers:{answer_a:'Model performs well on training data but poorly on new data',answer_b:'Model is too large',answer_c:'Model has too few parameters',answer_d:'Model trains too slowly'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'ML', question:'What is a neural network?', answers:{answer_a:'A computational model inspired by the human brain',answer_b:'A computer network',answer_c:'A database model',answer_d:'A search algorithm'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'ML', question:'What is gradient descent?', answers:{answer_a:'An optimization algorithm to minimize a loss function',answer_b:'A way to measure accuracy',answer_c:'A data preprocessing step',answer_d:'A model evaluation metric'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'ML', question:'What is cross-validation?', answers:{answer_a:'Technique to evaluate model performance on different data splits',answer_b:'A training optimizer',answer_c:'A data cleaning method',answer_d:'A neural network layer'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'ML', question:'What is the difference between classification and regression?', answers:{answer_a:'Classification predicts categories; regression predicts continuous values',answer_b:'They are the same',answer_c:'Classification predicts numbers; regression predicts labels',answer_d:'Regression is unsupervised'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'ML', question:'What is a confusion matrix?', answers:{answer_a:'A table showing true vs. predicted classifications',answer_b:'A matrix for neural weights',answer_c:'A data preprocessing tool',answer_d:'A loss function'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── COMPUTER NETWORKS ─────
  { category:'NETWORKING', question:'What is an IP address?', answers:{answer_a:'A unique numerical label for a device on a network',answer_b:'An internet protocol name',answer_c:'A file path',answer_d:'A server address format'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'NETWORKING', question:'What is TCP vs UDP?', answers:{answer_a:'TCP is connection-oriented and reliable; UDP is connectionless and faster',answer_b:'They are the same protocol',answer_c:'TCP is faster; UDP is reliable',answer_d:'UDP is for web; TCP is for files'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'NETWORKING', question:'What is DNS?', answers:{answer_a:'Domain Name System — translates domain names to IP addresses',answer_b:'Data Network Service',answer_c:'Dynamic Name Server',answer_d:'Distributed Network System'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'NETWORKING', question:'What is HTTP vs HTTPS?', answers:{answer_a:'HTTPS is HTTP with SSL/TLS encryption',answer_b:'They are identical',answer_c:'HTTP is faster and more secure',answer_d:'HTTPS is only for APIs'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'NETWORKING', question:'What is a subnet mask?', answers:{answer_a:'Identifies which part of an IP is network vs host',answer_b:'Blocks certain IP addresses',answer_c:'Encrypts network traffic',answer_d:'A MAC address filter'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'NETWORKING', question:'What is OSI model?', answers:{answer_a:'A 7-layer model describing network communication',answer_b:'An internet routing protocol',answer_c:'A network hardware standard',answer_d:'A firewall model'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'NETWORKING', question:'What is a firewall?', answers:{answer_a:'A security system that monitors and controls network traffic',answer_b:'A web server',answer_c:'A type of router',answer_d:'A DNS server'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'NETWORKING', question:'What is a REST API?', answers:{answer_a:'An architectural style for building web services over HTTP',answer_b:'A programming language',answer_c:'A database type',answer_d:'A server framework'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── OPERATING SYSTEMS ─────
  { category:'OS', question:'What is an operating system?', answers:{answer_a:'Software managing hardware and providing services to programs',answer_b:'A programming language',answer_c:'A web browser',answer_d:'A database system'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'OS', question:'What is a process?', answers:{answer_a:'A program in execution',answer_b:'A file on disk',answer_c:'A user account',answer_d:'A network connection'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'OS', question:'What is a thread?', answers:{answer_a:'The smallest unit of execution within a process',answer_b:'A network packet',answer_c:'A file descriptor',answer_d:'A memory block'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'OS', question:'What is deadlock?', answers:{answer_a:'Processes waiting for resources held by each other, indefinitely',answer_b:'A crashed process',answer_c:'A memory leak',answer_d:'A kernel panic'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'OS', question:'What is virtual memory?', answers:{answer_a:'Using disk space to extend RAM allowing larger programs to run',answer_b:'Encrypted memory',answer_c:'GPU memory',answer_d:'Cache memory'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'OS', question:'What is a semaphore?', answers:{answer_a:'A synchronization primitive to control access to shared resources',answer_b:'A network signal',answer_c:'A process command',answer_d:'A memory address'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'OS', question:'What is context switching?', answers:{answer_a:'OS saves/restores process state to switch between processes',answer_b:'Changing the user interface',answer_c:'Switching between users',answer_d:'Changing network connections'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'OS', question:'What is the kernel?', answers:{answer_a:'Core of the OS managing hardware resources',answer_b:'A user application',answer_c:'A file system',answer_d:'A device driver'}, correct_answer:'answer_a', difficulty:'easy' },

  // ───── DATABASE / MONGODB ─────
  { category:'MONGODB', question:'What is MongoDB?', answers:{answer_a:'A NoSQL document-oriented database',answer_b:'A relational database',answer_c:'A SQL database',answer_d:'A graph database'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'MONGODB', question:'What is a MongoDB document?', answers:{answer_a:'A JSON-like record stored in a collection',answer_b:'A table row',answer_c:'A database schema',answer_d:'A SQL query'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'MONGODB', question:'What is a MongoDB collection?', answers:{answer_a:'A group of documents (similar to a SQL table)',answer_b:'A database',answer_c:'A field in a document',answer_d:'An index'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'MONGODB', question:'What is Mongoose?', answers:{answer_a:'An ODM library for MongoDB and Node.js',answer_b:'A MongoDB GUI tool',answer_c:'A MongoDB cloud service',answer_d:'A MongoDB replication tool'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'MONGODB', question:'What is MongoDB Atlas?', answers:{answer_a:'A fully managed cloud MongoDB service',answer_b:'A MongoDB desktop tool',answer_c:'A MongoDB backup service',answer_d:'A MongoDB migration tool'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'MONGODB', question:'What is an aggregation pipeline?', answers:{answer_a:'A series of stages to transform documents',answer_b:'A query optimizer',answer_c:'An index builder',answer_d:'A replication mechanism'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'MONGODB', question:'What is sharding in MongoDB?', answers:{answer_a:'Distributing data across multiple machines for scalability',answer_b:'Encrypting data',answer_c:'Compressing documents',answer_d:'Creating backups'}, correct_answer:'answer_a', difficulty:'hard' },

  // ───── GIT ─────
  { category:'GIT', question:'What is Git?', answers:{answer_a:'A distributed version control system',answer_b:'A code editor',answer_c:'A project management tool',answer_d:'A CI/CD platform'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'GIT', question:'What is a Git commit?', answers:{answer_a:'A snapshot of changes saved to the repository',answer_b:'A code review',answer_c:'A merge request',answer_d:'A branch'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'GIT', question:'What is a Git branch?', answers:{answer_a:'An independent line of development',answer_b:'A remote repository',answer_c:'A commit message',answer_d:'A merge conflict'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'GIT', question:'What is git merge?', answers:{answer_a:'Combines changes from different branches',answer_b:'Deletes a branch',answer_c:'Creates a new commit',answer_d:'Pushes to remote'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'GIT', question:'What is git rebase?', answers:{answer_a:'Moves/applies commits from one branch onto another',answer_b:'Reverts the last commit',answer_c:'Creates a new branch',answer_d:'Merges with a conflict'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'GIT', question:'What is a pull request?', answers:{answer_a:'A proposal to merge changes into a branch for review',answer_b:'Pulling latest code',answer_c:'Cloning a repository',answer_d:'Fetching from remote'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'GIT', question:'What is git stash?', answers:{answer_a:'Temporarily saves work-in-progress changes',answer_b:'Deletes uncommitted changes',answer_c:'Creates a new tag',answer_d:'Updates the index'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'GIT', question:'What is gitignore?', answers:{answer_a:'A file specifying which files Git should not track',answer_b:'A Git error log',answer_c:'A branch naming convention',answer_d:'A merge strategy file'}, correct_answer:'answer_a', difficulty:'easy' },

  // ───── AWS / CLOUD ─────
  { category:'AWS', question:'What is Amazon Web Services (AWS)?', answers:{answer_a:'A cloud computing platform by Amazon',answer_b:'A programming framework',answer_c:'A database system',answer_d:'A web browser'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'AWS', question:'What is EC2?', answers:{answer_a:'Elastic Compute Cloud — virtual servers in the cloud',answer_b:'A database service',answer_c:'A storage service',answer_d:'A networking service'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'AWS', question:'What is S3?', answers:{answer_a:'Simple Storage Service — scalable object storage',answer_b:'A compute service',answer_c:'A database',answer_d:'A CDN service'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'AWS', question:'What is Lambda?', answers:{answer_a:'Serverless compute service — run code without managing servers',answer_b:'A database service',answer_c:'A virtual machine',answer_d:'A monitoring tool'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'AWS', question:'What is IAM in AWS?', answers:{answer_a:'Identity and Access Management — control access to AWS resources',answer_b:'Infrastructure Automation Module',answer_c:'Instance Address Manager',answer_d:'Internal API Manager'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'AWS', question:'What is RDS?', answers:{answer_a:'Relational Database Service — managed SQL databases',answer_b:'Remote Data Storage',answer_c:'Real-time Data Service',answer_d:'Resource Distribution Service'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── CYBERSECURITY ─────
  { category:'CYBERSECURITY', question:'What is XSS?', answers:{answer_a:'Cross-Site Scripting — injecting malicious scripts into web pages',answer_b:'XML Security System',answer_c:'Cross-Server Sync',answer_d:'Extended Security Schema'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CYBERSECURITY', question:'What is SQL Injection?', answers:{answer_a:'Inserting malicious SQL code to manipulate a database',answer_b:'A SQL optimization technique',answer_c:'A database migration method',answer_d:'A SQL testing tool'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CYBERSECURITY', question:'What is CSRF?', answers:{answer_a:'Cross-Site Request Forgery — tricks users into unwanted actions',answer_b:'Cross-Server Request Forwarding',answer_c:'Client-Side Request Filter',answer_d:'Content Security Response Feature'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'CYBERSECURITY', question:'What is encryption?', answers:{answer_a:'Converting data to an unreadable format to protect it',answer_b:'Compressing data',answer_c:'Deleting sensitive data',answer_d:'Backing up data'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'CYBERSECURITY', question:'What is a JWT token?', answers:{answer_a:'JSON Web Token — a secure way to transmit information between parties',answer_b:'JavaScript Test Tool',answer_c:'Java Web Transfer',answer_d:'JSON Web Table'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CYBERSECURITY', question:'What is hashing?', answers:{answer_a:'A one-way function converting data to a fixed-size string',answer_b:'Reversible encryption',answer_c:'Data compression',answer_d:'Data indexing'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CYBERSECURITY', question:'What is HTTPS?', answers:{answer_a:'HTTP with SSL/TLS for encrypted communication',answer_b:'A faster version of HTTP',answer_c:'An insecure protocol',answer_d:'A server protocol'}, correct_answer:'answer_a', difficulty:'easy' },

  // ───── TYPESCRIPT ─────
  { category:'TYPESCRIPT', question:'What is TypeScript?', answers:{answer_a:'A strongly typed superset of JavaScript',answer_b:'A completely separate language',answer_c:'A JavaScript framework',answer_d:'A CSS preprocessor'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'TYPESCRIPT', question:'What are TypeScript interfaces?', answers:{answer_a:'Contracts defining the shape of objects',answer_b:'UI components',answer_c:'HTML templates',answer_d:'Module imports'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'TYPESCRIPT', question:'What is TypeScript generics?', answers:{answer_a:'Allowing components to work with various types',answer_b:'A generic coding style',answer_c:'A TypeScript plugin',answer_d:'A build optimization'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'TYPESCRIPT', question:'What is the difference between any and unknown?', answers:{answer_a:'unknown requires type checking before use; any does not',answer_b:'They are identical',answer_c:'any is stricter than unknown',answer_d:'unknown allows any operation'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'TYPESCRIPT', question:'What is a TypeScript enum?', answers:{answer_a:'A set of named constants',answer_b:'A loop construct',answer_c:'A module system',answer_d:'An error handler'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── C / C++ ─────
  { category:'CPP', question:'What is C++?', answers:{answer_a:'A general-purpose programming language supporting OOP',answer_b:'A scripting language',answer_c:'A database language',answer_d:'A web framework'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'CPP', question:'What is a pointer in C++?', answers:{answer_a:'A variable storing the memory address of another variable',answer_b:'An index in an array',answer_c:'A function reference',answer_d:'A data type'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CPP', question:'What is a reference in C++?', answers:{answer_a:'An alias for an existing variable',answer_b:'A pointer to null',answer_c:'A new memory allocation',answer_d:'A function return value'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'CPP', question:'What is RAII in C++?', answers:{answer_a:'Resource Acquisition Is Initialization — tie resource lifecycle to objects',answer_b:'Recursive Algorithm Is Iterative',answer_c:'Random Access Input Interface',answer_d:'Rapid Application Integration Interface'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'CPP', question:'What is a constructor in C++?', answers:{answer_a:'A special function called when an object is created',answer_b:'A function that deletes an object',answer_c:'A static method',answer_d:'A global function'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'CPP', question:'What is the STL?', answers:{answer_a:'Standard Template Library — ready-to-use containers and algorithms',answer_b:'Standard Testing Library',answer_c:'String Template Layer',answer_d:'System Type Library'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── FLUTTER / DART ─────
  { category:'FLUTTER', question:'What is Flutter?', answers:{answer_a:'Google\'s UI toolkit for cross-platform app development',answer_b:'A backend framework',answer_c:'A database system',answer_d:'A CSS tool'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'FLUTTER', question:'What is a Widget in Flutter?', answers:{answer_a:'The building block of Flutter UI',answer_b:'A database model',answer_c:'A network request',answer_d:'A file handler'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'FLUTTER', question:'What is Dart?', answers:{answer_a:'The programming language used by Flutter',answer_b:'A JavaScript framework',answer_c:'A database query language',answer_d:'A CSS extension'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'FLUTTER', question:'What is setState in Flutter?', answers:{answer_a:'A method to update UI by rebuilding the widget',answer_b:'A global state management',answer_c:'A network state tracker',answer_d:'A database state'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'FLUTTER', question:'What is Provider in Flutter?', answers:{answer_a:'A state management and dependency injection solution',answer_b:'A network library',answer_c:'A database plugin',answer_d:'A flutter UI theme'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── ANDROID / KOTLIN ─────
  { category:'ANDROID', question:'What is Kotlin?', answers:{answer_a:'A modern language for Android development (also JVM)',answer_b:'A scripting language',answer_c:'A frontend framework',answer_d:'A database language'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'ANDROID', question:'What is an Activity in Android?', answers:{answer_a:'A single screen with user interface',answer_b:'A background service',answer_c:'A database operation',answer_d:'A network call'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'ANDROID', question:'What is a Fragment in Android?', answers:{answer_a:'A modular section of an activity\'s UI',answer_b:'A database table',answer_c:'A background thread',answer_d:'A file fragment'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'ANDROID', question:'What is Room in Android?', answers:{answer_a:'An abstraction layer over SQLite database',answer_b:'A UI layout system',answer_c:'A network library',answer_d:'An animation framework'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'ANDROID', question:'What is Kotlin coroutines?', answers:{answer_a:'Lightweight concurrency for async programming',answer_b:'A UI framework',answer_c:'A database driver',answer_d:'A design pattern'}, correct_answer:'answer_a', difficulty:'hard' },

  // ───── GRAPHQL ─────
  { category:'GRAPHQL', question:'What is GraphQL?', answers:{answer_a:'A query language for APIs and runtime for your queries',answer_b:'A graph database',answer_c:'A SQL extension',answer_d:'A REST API framework'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'GRAPHQL', question:'What is a GraphQL resolver?', answers:{answer_a:'A function that returns data for a field in the schema',answer_b:'A conflict resolver',answer_c:'A routing function',answer_d:'A caching mechanism'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'GRAPHQL', question:'What is GraphQL mutation?', answers:{answer_a:'An operation to write/modify data',answer_b:'A read operation',answer_c:'A subscription event',answer_d:'A schema definition'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'GRAPHQL', question:'What is the N+1 problem in GraphQL?', answers:{answer_a:'Making N extra DB queries for N items — solved by DataLoader',answer_b:'A schema validation issue',answer_c:'A subscription limit',answer_d:'A caching error'}, correct_answer:'answer_a', difficulty:'hard' },
  { category:'GRAPHQL', question:'What is Apollo Client?', answers:{answer_a:'A comprehensive state management and GraphQL client',answer_b:'A GraphQL server',answer_c:'A REST API client',answer_d:'A caching library'}, correct_answer:'answer_a', difficulty:'medium' },

  // ───── REDIS ─────
  { category:'REDIS', question:'What is Redis?', answers:{answer_a:'An in-memory data structure store used as cache/message broker',answer_b:'A relational database',answer_c:'A web server',answer_d:'A programming language'}, correct_answer:'answer_a', difficulty:'easy' },
  { category:'REDIS', question:'What data types does Redis support?', answers:{answer_a:'Strings, Lists, Sets, Hashes, Sorted Sets',answer_b:'Only strings',answer_c:'Only integers',answer_d:'Tables and Rows'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'REDIS', question:'What is Redis pub/sub?', answers:{answer_a:'A messaging pattern where publishers send to channels, subscribers receive',answer_b:'A read/write split',answer_c:'A replication strategy',answer_d:'A cluster mode'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'REDIS', question:'What is TTL in Redis?', answers:{answer_a:'Time To Live — how long a key exists before auto-deletion',answer_b:'Transaction Timeout Level',answer_c:'Total Traffic Limit',answer_d:'Type Transfer Layer'}, correct_answer:'answer_a', difficulty:'medium' },
  { category:'REDIS', question:'What is Redis Sentinel?', answers:{answer_a:'High availability solution for Redis with monitoring and failover',answer_b:'A Redis security feature',answer_c:'A Redis plugin',answer_d:'A Redis backup tool'}, correct_answer:'answer_a', difficulty:'hard' },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    await Question.deleteMany({});
    console.log('🗑️  Cleared existing questions');

    const inserted = await Question.insertMany(allQuestions);
    console.log(`✅ Successfully seeded ${inserted.length} questions`);

    const stats = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Questions per category:');
    stats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} questions`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
