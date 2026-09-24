import { doc, writeBatch, collection, getDocs, limit, query } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Company, InterviewExperience, Question, Answer } from '../types';

export const INITIAL_COMPANIES: Company[] = [
  {
    id: 'tcs',
    name: 'Tata Consultancy Services (TCS)',
    slug: 'tcs',
    category: 'Software Engineering',
    type: 'Service',
    description: 'Global leader in IT services, consulting & business solutions. Major campus recruiter across Indian engineering institutions via TCS NQT (National Qualifier Test), Digital, and Prime tracks.',
    experienceCount: 4,
    questionCount: 8,
    viewCount: 412,
    createdAt: new Date('2025-08-10').toISOString(),
  },
  {
    id: 'infosys',
    name: 'Infosys',
    slug: 'infosys',
    category: 'Software Engineering',
    type: 'Service',
    description: 'Global leader in next-generation digital services and consulting, hiring for Specialist Programmer (SP), Digital Specialist Engineer (DSE), and Systems Engineer (SE) roles.',
    experienceCount: 3,
    questionCount: 6,
    viewCount: 320,
    createdAt: new Date('2025-08-15').toISOString(),
  },
  {
    id: 'amazon',
    name: 'Amazon',
    slug: 'amazon',
    category: 'Software Engineering',
    type: 'Product',
    description: 'Multinational technology company focusing on e-commerce, cloud computing (AWS), online advertising, digital streaming, and artificial intelligence.',
    experienceCount: 3,
    questionCount: 7,
    viewCount: 560,
    createdAt: new Date('2025-08-20').toISOString(),
  },
  {
    id: 'deloitte',
    name: 'Deloitte',
    slug: 'deloitte',
    category: 'Data Analytics',
    type: 'Consulting',
    description: 'Leading global provider of audit and assurance, consulting, financial advisory, risk advisory, tax, and related services, hiring Analyst & Associate Software Engineers.',
    experienceCount: 2,
    questionCount: 5,
    viewCount: 245,
    createdAt: new Date('2025-08-22').toISOString(),
  },
  {
    id: 'cognizant',
    name: 'Cognizant',
    slug: 'cognizant',
    category: 'Software Engineering',
    type: 'Service',
    description: 'American multinational information technology services and consulting company hiring via GenC, GenC Elevate, and GenC Next tracks.',
    experienceCount: 2,
    questionCount: 4,
    viewCount: 190,
    createdAt: new Date('2025-09-01').toISOString(),
  },
  {
    id: 'google',
    name: 'Google',
    slug: 'google',
    category: 'Software Engineering',
    type: 'Product',
    description: 'American multinational corporation focused on online search, cloud computing, software, and quantum computing. Hires SWE Interns and full-time L3 Engineers.',
    experienceCount: 2,
    questionCount: 5,
    viewCount: 680,
    createdAt: new Date('2025-09-05').toISOString(),
  },
];

export const INITIAL_EXPERIENCES: InterviewExperience[] = [
  {
    id: 'exp-tcs-1',
    userId: 'seed-user-1',
    authorName: 'Aarav Sharma',
    authorCollege: 'GIET University, Gunupur',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services (TCS)',
    role: 'Digital Software Engineer',
    interviewType: 'Campus',
    year: 2025,
    result: 'Selected',
    difficulty: 'Moderate',
    rounds: [
      {
        roundName: 'Aptitude & Coding (NQT)',
        questions: [
          'Numerical Ability: Profit & loss, permutations, probability',
          'Coding Question 1: Check if an array can be divided into pairs whose sum is divisible by k',
          'Coding Question 2: Longest subsegment of 1s formed by replacing at most k 0s',
        ],
      },
      {
        roundName: 'Technical Round',
        questions: [
          'What are the 4 pillars of Object-Oriented Programming? Give real-world examples.',
          'Difference between ArrayList and LinkedList in Java. When would you prefer which?',
          'Explain SQL JOIN types (INNER, LEFT, RIGHT, FULL OUTER) and write a query to find the 2nd highest salary.',
          'Explain ACID properties in DBMS with a bank transaction example.',
        ],
      },
      {
        roundName: 'Managerial & HR Round',
        questions: [
          'Tell me about your final year project and your individual contribution.',
          'Are you willing to relocate anywhere in India and work in night shifts if required?',
        ],
      },
    ],
    technologies: ['Java', 'SQL', 'DBMS', 'OOP', 'DSA'],
    tags: ['Backend', 'DSA & Problem Solving', 'DBMS & SQL', 'OOP & Design Patterns', 'Enterprise Software'],
    experienceText: 'Attended the TCS Digital on-campus drive. The NQT round was moderately tricky in the advanced coding section. In the technical round, the interviewer focused heavily on core fundamentals: OOPs concepts in Java, collection framework internals, and SQL indexing.',
    advice: 'Do not just memorize definitions. Understand internal working (e.g. how HashMap handles collisions) and be confident with your resume projects.',
    overallRating: 4.5,
    upvotes: 34,
    upvotedBy: ['seed-user-2', 'seed-user-3', 'seed-user-4'],
    bookmarkedBy: ['seed-user-2'],
    status: 'approved',
    createdAt: new Date('2025-08-15').toISOString(),
  },
  {
    id: 'exp-tcs-2',
    userId: 'seed-user-2',
    authorName: 'Priya Patel',
    authorCollege: 'NIT Rourkela',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services (TCS)',
    role: 'System Engineer (Ninja)',
    interviewType: 'Campus',
    year: 2025,
    result: 'Selected',
    difficulty: 'Easy',
    rounds: [
      {
        roundName: 'TCS NQT',
        questions: [
          'Quantitative aptitude and verbal reasoning',
          'Basic coding: Reverse a string without using library functions',
        ],
      },
      {
        roundName: 'Technical & HR Combined',
        questions: [
          'Explain Method Overloading vs Method Overriding in Java.',
          'What is normalization in DBMS? Explain 1NF, 2NF, 3NF.',
          'Why do you want to join TCS?',
        ],
      },
    ],
    technologies: ['Java', 'Python', 'DBMS', 'SQL'],
    tags: ['Software Engineering', 'Java Fundamentals', 'DBMS & SQL', 'Campus Placement'],
    experienceText: 'The process was very smooth and student friendly. Interviewer asked me about my favorite programming language (Java) and asked me to write code on paper for string reversal and prime check.',
    advice: 'Be calm and transparent. If you don’t know an answer, admit it politely rather than guessing.',
    overallRating: 4.0,
    upvotes: 18,
    upvotedBy: ['seed-user-1'],
    bookmarkedBy: [],
    status: 'approved',
    createdAt: new Date('2025-08-18').toISOString(),
  },
  {
    id: 'exp-tcs-3',
    userId: 'seed-user-3',
    authorName: 'Rohan Verma',
    authorCollege: 'VSSUT Burla',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services (TCS)',
    role: 'Prime Software Engineer',
    interviewType: 'Campus',
    year: 2025,
    result: 'Not Selected',
    difficulty: 'Difficult',
    rounds: [
      {
        roundName: 'Prime Coding Round',
        questions: [
          'Graph BFS/DFS problem on grid traversal with minimum cost path',
          'Dynamic programming problem: Coin Change variant',
        ],
      },
      {
        roundName: 'Technical Round',
        questions: [
          'Explain internal working of Spring Boot auto-configuration.',
          'How does B-Tree indexing work in MySQL under the hood?',
          'Write code to detect a cycle in a Directed Graph.',
        ],
      },
    ],
    technologies: ['Java', 'Spring Boot', 'DSA', 'Graphs', 'DBMS'],
    tags: ['Backend', 'DSA & Problem Solving', 'System Design', 'Microservices & Spring Boot'],
    experienceText: 'Prime track interview was significantly more demanding than Ninja/Digital. I cleared the coding round but struggled in the technical interview when asked about deep Spring Boot internals and distributed transactions.',
    advice: 'If aiming for the Prime package (9 LPA+), master Graphs, DP, and end-to-end backend architectural concepts. Do not take it lightly.',
    overallRating: 3.5,
    upvotes: 27,
    upvotedBy: ['seed-user-1', 'seed-user-2'],
    bookmarkedBy: ['seed-user-1'],
    status: 'approved',
    createdAt: new Date('2025-08-25').toISOString(),
  },
  {
    id: 'exp-tcs-4',
    userId: 'seed-user-4',
    authorName: 'Sneha Kulkarni',
    authorCollege: 'COEP Pune',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services (TCS)',
    role: 'Data Analyst',
    interviewType: 'Campus',
    year: 2025,
    result: 'Selected',
    difficulty: 'Moderate',
    rounds: [
      {
        roundName: 'Online Assessment',
        questions: [
          'Aptitude, data interpretation charts, basic Python & SQL queries',
        ],
      },
      {
        roundName: 'Technical Interview',
        questions: [
          'Explain SQL GROUP BY vs HAVING clause with an example.',
          'What are Window functions in SQL? Write ROW_NUMBER() and DENSE_RANK().',
          'Explain how you handled missing data in your machine learning project.',
        ],
      },
    ],
    technologies: ['SQL', 'Python', 'Power BI', 'Excel', 'Pandas'],
    tags: ['Data Analytics', 'DBMS & SQL', 'Business Intelligence', 'Python & Pandas'],
    experienceText: 'Specialized interview for Data Analytics. Was asked to write multiple complex SQL queries involving CTEs and window functions on a shared screen.',
    advice: 'SQL is 80% of the game for data analyst roles. Practice LeetCode SQL 50.',
    overallRating: 4.2,
    upvotes: 21,
    upvotedBy: ['seed-user-1'],
    bookmarkedBy: [],
    status: 'approved',
    createdAt: new Date('2025-09-02').toISOString(),
  },
  {
    id: 'exp-amazon-1',
    userId: 'seed-user-5',
    authorName: 'Vikram Sengupta',
    authorCollege: 'IIT Bhubaneswar',
    companyId: 'amazon',
    companyName: 'Amazon',
    role: 'SDE-1',
    interviewType: 'Off-campus',
    year: 2025,
    result: 'Selected',
    difficulty: 'Difficult',
    rounds: [
      {
        roundName: 'Online Assessment (OA)',
        questions: [
          'OA Question 1: Rotten Oranges (Multi-source BFS)',
          'OA Question 2: Top K Frequent Elements in streaming data',
          'Amazon Work Style Assessment (Leadership Principles)',
        ],
      },
      {
        roundName: 'Technical Round 1',
        questions: [
          'Coding: Lowest Common Ancestor in a Binary Tree (LeetCode 236)',
          'LP: Tell me about a time you had to deliver under tight deadlines (Deliver Results)',
        ],
      },
      {
        roundName: 'Technical Round 2',
        questions: [
          'Coding: LRU Cache implementation with O(1) get and put using HashMap + DoublyLinkedList',
          'LP: Tell me about a time you disagreed with a team member (Have Backbone; Disagree and Commit)',
        ],
      },
    ],
    technologies: ['C++', 'DSA', 'Trees', 'Graphs', 'System Design'],
    tags: ['Backend', 'DSA & Problem Solving', 'System Design', 'Behavioral / Leadership Principles', 'FAANG / Tier-1'],
    experienceText: 'Applied via Amazon job portal with an employee referral. The interview process spanned 3 weeks. Both coding rounds had 20 minutes strictly dedicated to Amazon Leadership Principles using the STAR method.',
    advice: 'Never ignore Amazon Leadership Principles! Prepare 2 STAR stories for every LP. For coding, write clean modular production-level code with variable names.',
    overallRating: 4.8,
    upvotes: 49,
    upvotedBy: ['seed-user-1', 'seed-user-2', 'seed-user-3', 'seed-user-4'],
    bookmarkedBy: ['seed-user-1', 'seed-user-2'],
    status: 'approved',
    createdAt: new Date('2025-08-28').toISOString(),
  },
  {
    id: 'exp-infosys-1',
    userId: 'seed-user-6',
    authorName: 'Ananya Mishra',
    authorCollege: 'KIIT University, Bhubaneswar',
    companyId: 'infosys',
    companyName: 'Infosys',
    role: 'Specialist Programmer (SP)',
    interviewType: 'Campus',
    year: 2025,
    result: 'Selected',
    difficulty: 'Difficult',
    rounds: [
      {
        roundName: 'HackWithInfy Coding Round',
        questions: [
          'Question 1: Dynamic Programming - Partition Array for Maximum Sum',
          'Question 2: Graph Shortest Path with Vertex Weights',
          'Question 3: String manipulation with Trie',
        ],
      },
      {
        roundName: 'Technical Interview',
        questions: [
          'Explain Dijkstra’s algorithm and time complexity.',
          'What is virtual memory and paging in Operating Systems?',
          'Difference between TCP and UDP with handshaking mechanism.',
        ],
      },
    ],
    technologies: ['Java', 'C++', 'DSA', 'Operating Systems', 'Computer Networks'],
    tags: ['Competitive Programming', 'DSA & Problem Solving', 'Operating Systems', 'Computer Networks'],
    experienceText: 'Got selected for SP interview via HackWithInfy grand finale. SP interview focuses strictly on competitive programming and operating system fundamentals.',
    advice: 'Solve LeetCode Medium/Hard DP and Graph problems. Practice talking out loud while coding.',
    overallRating: 4.6,
    upvotes: 38,
    upvotedBy: ['seed-user-1', 'seed-user-3'],
    bookmarkedBy: ['seed-user-3'],
    status: 'approved',
    createdAt: new Date('2025-08-20').toISOString(),
  },
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q-reverse-string',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services (TCS)',
    type: 'Coding',
    questionText: 'Write a program to reverse a given string without using built-in library reverse functions.',
    normalizedText: 'reverse a string without built in library functions',
    technology: 'Java',
    topic: 'Strings & Pointers',
    difficulty: 'Easy',
    language: 'Java',
    solution: `public class StringReversal {
    public static String reverse(String str) {
        if (str == null) return null;
        char[] chars = str.toCharArray();
        int left = 0, right = chars.length - 1;
        while (left < right) {
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }
        return new String(chars);
    }
}`,
    explanation: 'Uses a two-pointer approach swapping characters from opposite ends in-place with O(N) time and O(N) auxiliary space for the character array.',
    askedCount: 37,
    askedByUserIds: ['seed-user-1', 'seed-user-2'],
    upvotes: 45,
    upvotedBy: ['seed-user-1', 'seed-user-2', 'seed-user-3'],
    status: 'approved',
    companiesAsked: ['TCS', 'Infosys', 'Wipro', 'Tech Mahindra', 'Cognizant'],
    createdAt: new Date('2025-08-01').toISOString(),
  },
  {
    id: 'q-oop-concepts',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services (TCS)',
    type: 'Technical',
    questionText: 'What are the 4 fundamental pillars of Object-Oriented Programming (OOP)? Explain each with a real-world example.',
    normalizedText: 'four fundamental pillars of object oriented programming oop concepts',
    technology: 'OOP',
    topic: 'Core OOP',
    difficulty: 'Easy',
    solution: `1. Encapsulation: Binding data and methods into a single unit (e.g. Bank Account class protecting accountBalance via private modifier and getters/setters).
2. Abstraction: Hiding internal complexity and showing essential features (e.g. Car accelerator pedal; user presses pedal without knowing fuel injection mechanics).
3. Inheritance: Mechanism where child class acquires parent properties (e.g. Dog inherits from Animal).
4. Polymorphism: Ability to take many forms (Compile-time overloading like draw(int), draw(String), and Runtime overriding like animal.sound()).`,
    explanation: 'One of the most frequently asked foundational questions in university campus interviews across both product and service companies.',
    askedCount: 42,
    askedByUserIds: ['seed-user-1', 'seed-user-3'],
    upvotes: 56,
    upvotedBy: ['seed-user-1', 'seed-user-3', 'seed-user-4', 'seed-user-5'],
    status: 'approved',
    companiesAsked: ['TCS', 'Infosys', 'Accenture', 'Cognizant', 'Deloitte', 'Wipro'],
    createdAt: new Date('2025-08-02').toISOString(),
  },
  {
    id: 'q-arraylist-vs-linkedlist',
    companyId: 'tcs',
    companyName: 'Tata Consultancy Services (TCS)',
    type: 'Technical',
    questionText: 'What is the key difference between ArrayList and LinkedList in Java? When should you prefer one over the other?',
    normalizedText: 'difference between arraylist and linkedlist in java collections',
    technology: 'Java',
    topic: 'Collections Framework',
    difficulty: 'Medium',
    solution: `1. Data Structure: ArrayList is backed by a dynamic resizing array, while LinkedList is a doubly-linked list.
2. Search (get): ArrayList has O(1) random access by index. LinkedList requires O(N) traversal.
3. Insertion/Deletion: Inserting in the middle requires O(N) shifting in ArrayList, but O(1) pointer updates in LinkedList once the node is located.
4. Memory: ArrayList has less memory overhead per element. LinkedList requires additional node pointers (prev and next).
Preference: Use ArrayList by default when reads dominate; LinkedList when frequent additions/removals at both ends (Deque) occur.`,
    explanation: 'Tests the student understanding of memory locality, cache lines, and algorithmic time complexity in Java.',
    askedCount: 31,
    askedByUserIds: ['seed-user-1'],
    upvotes: 39,
    upvotedBy: ['seed-user-1', 'seed-user-2'],
    status: 'approved',
    companiesAsked: ['TCS', 'Cognizant', 'Tech Mahindra', 'Infosys'],
    createdAt: new Date('2025-08-05').toISOString(),
  },
  {
    id: 'q-sql-join-types',
    companyId: 'deloitte',
    companyName: 'Deloitte',
    type: 'Technical',
    questionText: 'Explain the different types of SQL JOINs (INNER, LEFT, RIGHT, FULL OUTER) and write a query to find the 2nd highest salary from an Employee table.',
    normalizedText: 'sql join types inner left right full outer and second highest salary query',
    technology: 'SQL',
    topic: 'Relational Database Queries',
    difficulty: 'Medium',
    solution: `SQL Joins:
- INNER JOIN: Returns records that have matching values in both tables.
- LEFT (OUTER) JOIN: Returns all records from the left table and matched records from the right table.
- RIGHT (OUTER) JOIN: Returns all records from the right table and matched records from the left table.
- FULL (OUTER) JOIN: Returns all records when there is a match in either left or right table.

Second Highest Salary Query:
SELECT MAX(salary) AS SecondHighestSalary
FROM Employee
WHERE salary < (SELECT MAX(salary) FROM Employee);

Alternative using DENSE_RANK():
WITH RankedSalaries AS (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) as rank_num
    FROM Employee
)
SELECT salary FROM RankedSalaries WHERE rank_num = 2 LIMIT 1;`,
    explanation: 'A staple question asked in virtually every Data Analyst, Software Engineer, and Business Analyst interview.',
    askedCount: 28,
    askedByUserIds: ['seed-user-1', 'seed-user-4'],
    upvotes: 32,
    upvotedBy: ['seed-user-1', 'seed-user-4'],
    status: 'approved',
    companiesAsked: ['Deloitte', 'Infosys', 'TCS', 'Amazon', 'Cognizant'],
    createdAt: new Date('2025-08-07').toISOString(),
  },
  {
    id: 'q-lru-cache',
    companyId: 'amazon',
    companyName: 'Amazon',
    type: 'Coding',
    questionText: 'Design and implement a data structure for Least Recently Used (LRU) Cache with get(key) and put(key, value) in O(1) time complexity.',
    normalizedText: 'design lru cache least recently used get put o 1 time complexity',
    technology: 'DSA',
    topic: 'Hash Tables & Doubly Linked List',
    difficulty: 'Hard',
    language: 'Java',
    solution: `// Implemented using a HashMap<Integer, Node> and Doubly Linked List with dummy Head and Tail nodes
class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }
    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0, 0);
    private final Node tail = new Node(0, 0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }
    // O(1) get & put operations
}`,
    explanation: 'Combines Doubly Linked List for O(1) removal and insertion at head/tail with HashMap for O(1) pointer lookup.',
    askedCount: 22,
    askedByUserIds: ['seed-user-5'],
    upvotes: 61,
    upvotedBy: ['seed-user-1', 'seed-user-2', 'seed-user-3', 'seed-user-5'],
    status: 'approved',
    companiesAsked: ['Amazon', 'Google', 'Microsoft', 'Flipkart'],
    createdAt: new Date('2025-08-12').toISOString(),
  },
];

export const INITIAL_ANSWERS: Answer[] = [
  {
    id: 'ans-1',
    questionId: 'q-arraylist-vs-linkedlist',
    userId: 'seed-user-1',
    authorName: 'Aarav Sharma',
    authorCollege: 'GIET University',
    answerText: 'Always mention CPU Cache Locality during the interview! Modern CPUs love ArrayList because contiguous memory elements are loaded into the L1/L2 cache prefetchers. LinkedList nodes are scattered in heap memory, causing frequent cache misses. Interviewers really appreciate this depth.',
    upvotes: 43,
    downvotes: 1,
    upvotedBy: ['seed-user-2', 'seed-user-3', 'seed-user-4'],
    downvotedBy: [],
    createdAt: new Date('2025-08-06').toISOString(),
  },
  {
    id: 'ans-2',
    questionId: 'q-sql-join-types',
    userId: 'seed-user-4',
    authorName: 'Sneha Kulkarni',
    authorCollege: 'COEP Pune',
    answerText: 'Be sure to mention DENSE_RANK() vs RANK() when answering the second highest salary query! If multiple employees share the highest salary (e.g. 100k, 100k, 90k), RANK() will skip rank 2 and jump to rank 3, which fails! DENSE_RANK() correctly assigns rank 2 to 90k.',
    upvotes: 38,
    downvotes: 0,
    upvotedBy: ['seed-user-1', 'seed-user-5'],
    downvotedBy: [],
    createdAt: new Date('2025-08-08').toISOString(),
  },
];

export async function checkAndSeedInitialData(): Promise<boolean> {
  const currentUser = auth.currentUser;
  // Security check: Only attempt write batch when an authorized admin is signed in
  if (!currentUser) {
    return false;
  }

  const isAdmin = currentUser.email?.toLowerCase() === 'sahoopitendrakumar@gmail.com';
  if (!isAdmin) {
    return false;
  }

  try {
    const compSnap = await getDocs(query(collection(db, 'companies'), limit(1)));
    if (!compSnap.empty) {
      return false; // Already populated
    }

    const batch = writeBatch(db);

    for (const comp of INITIAL_COMPANIES) {
      batch.set(doc(db, 'companies', comp.id), comp);
    }

    for (const exp of INITIAL_EXPERIENCES) {
      batch.set(doc(db, 'experiences', exp.id), exp);
    }

    for (const q of INITIAL_QUESTIONS) {
      batch.set(doc(db, 'questions', q.id), q);
    }

    for (const ans of INITIAL_ANSWERS) {
      batch.set(doc(db, 'answers', ans.id), ans);
    }

    await batch.commit();
    console.log('Successfully seeded initial community database by administrator!');
    return true;
  } catch (error) {
    console.warn('Initial seeding skipped:', error);
    return false;
  }
}
