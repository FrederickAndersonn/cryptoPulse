describe('Signup Page', () => {
  beforeEach(() => {
    cy.visit('/signup');
  });

  it('should display the signup form', () => {
    cy.get('[data-testid="signup-heading"]').should('contain', 'Sign Up');
    cy.get('[data-testid="signup-name"]').should('be.visible');
    cy.get('[data-testid="signup-email"]').should('be.visible');
    cy.get('[data-testid="signup-password"]').should('be.visible');
    cy.get('[data-testid="signup-button"]').should('be.visible');
  });

  it('should display password error if password is less than 5 characters', () => {
    cy.get('[data-testid="signup-name"]').type('John Doe');
    cy.get('[data-testid="signup-email"]').type('john.doe@example.com');
    cy.get('[data-testid="signup-password"]').type('1234');
    cy.get('[data-testid="signup-button"]').click();

    cy.get('[data-testid="password-error"]').should('contain', 'Password must be at least 5 characters long.');
  });

  it('should navigate to login page on successful signup', () => {
    cy.intercept('POST', 'https://cryptopulse-n0ol.onrender.com/register', {
      statusCode: 200,
      body: { token: 'dummy_token', userid: 'dummy_userid' },
    }).as('signupRequest');

    cy.get('[data-testid="signup-name"]').type('John Doe');
    cy.get('[data-testid="signup-email"]').type('john.doe@example.com');
    cy.get('[data-testid="signup-password"]').type('12345');
    cy.get('[data-testid="signup-button"]').click();

    cy.wait('@signupRequest');
    cy.url().should('include', '/login');
  });

  it('should navigate to login page when clicking the login link', () => {
    cy.get('[data-testid="signup-login-link"]').click();
    cy.url().should('include', '/login');
  });
});

describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('[data-testid="login-heading"]').should('contain', 'Login');
    cy.get('[data-testid="login-email"]').should('be.visible');
    cy.get('[data-testid="login-password"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
  });

  it('should handle login error', () => {
    cy.intercept('POST', 'https://cryptopulse-n0ol.onrender.com/login', {
      statusCode: 401,
      body: { error: 'Invalid credentials' },
    }).as('loginRequest');

    cy.get('[data-testid="login-email"]').type('wrong@example.com');
    cy.get('[data-testid="login-password"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequest');
    cy.get('.chakra-toast').should('contain', 'Login Failed');
  });

  it('should navigate to coins page on successful login', () => {
    cy.intercept('POST', 'https://cryptopulse-n0ol.onrender.com/login', {
      statusCode: 200,
      body: { token: 'dummy_token', userid: 'dummy_userid' },
    }).as('loginRequest');

    cy.get('[data-testid="login-email"]').type('test@example.com');
    cy.get('[data-testid="login-password"]').type('testpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/coins');
  });

  it('should navigate to signup page when clicking the signup link', () => {
    cy.get('[data-testid="login-signup-link"]').click();
    cy.url().should('include', '/signup');
  });
});

describe('Send Funds Form', () => {
  beforeEach(() => {
    // Mock localStorage to simulate a logged-in user
    cy.window().then(win => {
      win.localStorage.setItem('token', 'dummy_token');
    });
    cy.visit('/sendfunds');
  });

  it('should display the send funds form', () => {
    cy.get('[data-testid="send-funds-heading"]').should('contain', 'Send Funds');
    cy.get('[data-testid="send-funds-destination-id"]').should('be.visible');
    cy.get('[data-testid="send-funds-amount"]').should('be.visible');
    cy.get('[data-testid="send-funds-memo"]').should('be.visible');
    cy.get('[data-testid="send-funds-button"]').should('be.visible');
  });

  it('should handle sending funds successfully', () => {
    cy.intercept('POST', '/sendfunds', {
      statusCode: 200,
      body: { success: true },
    }).as('sendFundsRequest');

    cy.get('[data-testid="send-funds-destination-id"]').clear().type('testAddress123');
    cy.get('[data-testid="send-funds-amount"]').type('100');
    cy.get('[data-testid="send-funds-memo"]').type('Test memo');
    cy.get('[data-testid="send-funds-button"]').click();
    cy.get('.chakra-toast').should('contain', 'Funds sent successfully.');
  });

  it('should navigate to login page if not logged in', () => {
    // Clear localStorage to simulate a not logged-in user
    cy.window().then(win => {
      win.localStorage.removeItem('token');
    });
    cy.visit('/sendfunds');

    cy.url().should('include', '/login');
  });
});

describe('Forum Page', () => {
  beforeEach(() => {
    // Mock localStorage to simulate a logged-in user with a valid JWT
    const validDummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                            'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
                            'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    cy.window().then(win => {
      win.localStorage.setItem('token', validDummyToken);
    });

    // Mock the API response for getting posts
    cy.intercept('GET', 'https://cryptopulse-n0ol.onrender.com/posts', {
      body: [
        {
          _id: "post1",
          heading: "Test Post 1",
          description: "This is a test post description. It contains enough words to be truncated in the forum display.",
          author: {
            id: "author1",
            username: "testuser"
          },
          date: "2023-01-01T00:00:00.000Z",
          votes: 10,
          votedBy: []
        },
        {
          _id: "post2",
          heading: "Another Test Post",
          description: "This is another test post description.",
          author: {
            id: "author2",
            username: "anotheruser"
          },
          date: "2023-01-02T00:00:00.000Z",
          votes: 5,
          votedBy: []
        }
      ]
    }).as('getPosts');

    cy.visit('/forum');
  });

  it('should display the forum page and posts', () => {
    cy.wait('@getPosts');
    cy.get('[data-testid="forum-heading"]').should('contain', 'Forum');
    cy.get('[data-testid="create-post-button"]').should('be.visible');
    cy.get('[data-testid="search-input"]').should('be.visible');
    cy.get('[data-testid^="post-"]').should('have.length', 2);
  });

  it('should redirect to login page if user is not logged in and tries to navigate to create post page', () => {
    // Clear localStorage to simulate a logged-out user
    cy.window().then(win => {
      win.localStorage.removeItem('token');
    });

    cy.visit('/forum');
    cy.get('[data-testid="create-post-button"]').click();
    cy.url().should('include', '/login');
  });

  it('should filter posts by search term', () => {
    cy.wait('@getPosts');
    cy.get('[data-testid="search-input"]').type('Test Post 1');
    cy.get('[data-testid="post-post1"]').should('be.visible');
    cy.get('[data-testid="post-post2"]').should('not.exist');
  });

  it('should handle pagination', () => {
    cy.wait('@getPosts');
    cy.get('[data-testid="next-page-button"]').should('be.visible');
    cy.get('[data-testid="previous-page-button"]').should('be.visible');
  });

  it('should handle upvoting a post', () => {
    cy.wait('@getPosts');
    cy.intercept('POST', 'https://cryptopulse-n0ol.onrender.com/posts/post1/vote', {
      body: {
        _id: "post1",
        heading: "Test Post 1",
        description: "This is a test post description. It contains enough words to be truncated in the forum display.",
        author: {
          id: "author1",
          username: "testuser"
        },
        date: "2023-01-01T00:00:00.000Z",
        votes: 11,
        votedBy: []
      }
    }).as('upvotePost');

    cy.get('[data-testid="upvote-button-post1"]').click();
    cy.wait('@upvotePost');
    cy.get('[data-testid="upvote-button-post1"]').should('have.css', 'background-color', 'rgb(49, 151, 149)');
  });

  it('should handle downvoting a post', () => {
    cy.wait('@getPosts');
    cy.intercept('POST', 'https://cryptopulse-n0ol.onrender.com/posts/post1/vote', {
      body: {
        _id: "post1",
        heading: "Test Post 1",
        description: "This is a test post description. It contains enough words to be truncated in the forum display.",
        author: {
          id: "author1",
          username: "testuser"
        },
        date: "2023-01-01T00:00:00.000Z",
        votes: 9,
        votedBy: []
      }
    }).as('downvotePost');

    cy.get('[data-testid="downvote-button-post1"]').click();
    cy.wait('@downvotePost');
    cy.get('[data-testid="downvote-button-post1"]').should('have.css', 'background-color', 'rgb(229, 62, 62)');
  });
});

describe('Watchlist Table', () => {
  beforeEach(() => {
    // Mock localStorage to simulate a logged-in user
    const validDummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                            'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
                            'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    cy.window().then(win => {
      win.localStorage.setItem('token', validDummyToken);
      win.localStorage.setItem('userId', 'user123');
    });

    // Mock the API response for getting the watchlist
    cy.intercept('GET', '**/user/user123/watchlist', {
      body: ['bitcoin', 'ethereum']
    }).as('getWatchlist');

    // Mock the API response for getting coin data
    cy.intercept('GET', '**/coins/markets*', {
      body: [
        {
          id: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'btc',
          image: 'https://cryptocompare.com/media/37746251/btc.png',
          current_price: 50000,
          last_7_days: [/* sample data */]
        },
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'eth',
          image: 'https://cryptocompare.com/media/37746238/eth.png',
          current_price: 4000,
          last_7_days: [/* sample data */]
        }
      ]
    }).as('getCoinData');

    // Mock the API response for removing from watchlist
    cy.intercept('DELETE', '**/user/user123/watchlist/bitcoin', {
      body: ['ethereum']
    }).as('removeFromWatchlist');

    cy.visit('/watchlist');
  });

  it('should display the watchlist table and coins', () => {
    cy.wait('@getWatchlist');
    cy.wait('@getCoinData');
    cy.get('[data-testid="watchlist-table"]').should('be.visible');
    cy.get('[data-testid^="coin-row-"]').should('have.length', 2);
  });

  it('should navigate to coin detail page on row click', () => {
    cy.wait('@getWatchlist');
    cy.wait('@getCoinData');
    cy.get('[data-testid="coin-row-bitcoin"]').click();
    cy.url().should('include', '/coin/bitcoin');
  });

  it('should remove a coin from the watchlist', () => {
    cy.wait('@getWatchlist');
    cy.wait('@getCoinData');
    cy.get('[data-testid="remove-button-bitcoin"]').click();
    cy.wait('@removeFromWatchlist');
    cy.get('[data-testid="coin-row-bitcoin"]').should('not.exist');
  });
});

describe('Create Post Page', () => {
  beforeEach(() => {
    // Mock localStorage to simulate a logged-in user
    const validDummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                            'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
                            'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    cy.window().then(win => {
      win.localStorage.setItem('token', validDummyToken);
      win.localStorage.setItem('userId', 'user123');
    });

    // Mock the API response for getting user details
    cy.intercept('GET', '**/register/user/user123', {
      body: {
        name: 'testuser',
      }
    }).as('getUserDetails');

    // Mock the API response for creating a post
    cy.intercept('POST', '**/posts', {
      statusCode: 201,
      body: {
        id: 'newpost',
        heading: 'Test Post',
        description: 'This is a test post description.',
        date: new Date().toISOString(),
        author: {
          id: 'user123',
          username: 'testuser',
        },
      }
    }).as('createPost');

    cy.visit('/create-post');
  });

  it('should create a new post', () => {
    cy.get('[data-testid="create-post-heading-input"]').type('Test Post');
    cy.get('[data-testid="create-post-description-input"]').type('This is a test post description.');
    cy.get('[data-testid="create-post-button"]').click();
    cy.wait('@createPost');
    cy.url().should('include', '/forum');
  });

  it('should redirect to login if no token is found', () => {
    // Clear localStorage to simulate a logged-out user
    cy.window().then(win => {
      win.localStorage.removeItem('token');
    });

    cy.visit('/create-post');
    cy.url().should('include', '/login');
  });
});

describe('Coin Table Page', () => {
  beforeEach(() => {
    // Mock localStorage to simulate a logged-in user
    const validDummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                            'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
                            'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    cy.window().then(win => {
      win.localStorage.setItem('token', validDummyToken);
      win.localStorage.setItem('userId', 'user123');
    });

    cy.intercept('PUT', '**/user/user123/watchlist', {
      body: ['tether']
    }).as('addToWatchlist');

    cy.visit('/coins');
  });

  it('should search for Tether and add it to the watchlist', () => {
    cy.get('[data-testid="coin-search-input"]').type('Tether');
    cy.contains('[data-testid^="coin-row-"]', 'Tether').should('be.visible');
    cy.contains('[data-testid^="coin-row-"]', 'Tether')
      .find('[data-testid^="add-to-watchlist-button-"]')
      .click();
    cy.wait('@addToWatchlist');
    cy.get('.chakra-toast').should('contain', 'Coin added to watchlist.');
  });

  it('should navigate between pages', () => {
    cy.get('[data-testid="next-page-button"]').click();
    cy.get('[data-testid="page-number"]').should('contain', 'Page 2');
    cy.get('[data-testid="previous-page-button"]').click();
    cy.get('[data-testid="page-number"]').should('contain', 'Page 1');
  });
});

describe('Crypto Converter Page', () => {
  beforeEach(() => {
    // Mock the API response for getting the crypto list
    cy.intercept('GET', 'https://api.coingecko.com/api/v3/coins/markets*', {
      body: [
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum' },
        { id: 'tether', symbol: 'usdt', name: 'Tether' },
      ]
    }).as('getCryptoList');

    // Mock the API response for getting the conversion rate
    cy.intercept('GET', 'https://api.coingecko.com/api/v3/simple/price*', {
      body: {
        tether: {
          usd: 1,
        }
      }
    }).as('getConversionRate');

    cy.visit('/cryptoconverter');
  });

  it('should display the converter form', () => {
    cy.wait('@getCryptoList');
    cy.get('[data-testid="heading"]').should('contain', 'Crypto Converter');
    cy.get('[data-testid="amount-input"]').should('be.visible');
    cy.get('[data-testid="from-currency-select"]').should('be.visible');
    cy.get('[data-testid="to-currency-select"]').should('be.visible');
    cy.get('[data-testid="convert-button"]').should('be.visible');
  });

  it('should allow user to select currencies and convert amount', () => {
    cy.wait('@getCryptoList');
    
    cy.get('[data-testid="amount-input"]').type('100');
    cy.get('[data-testid="from-currency-select"]').select('USD');
    cy.get('[data-testid="to-currency-select"]').select('Tether (USDT)');
    
    cy.get('[data-testid="convert-button"]').click();

    cy.wait('@getConversionRate');
    
    cy.get('[data-testid="result"]').should('contain', '100 USD is equal to 100.00000000 tether');
  });

  it('should show an error message for invalid amount input', () => {
    cy.wait('@getCryptoList');
    
    cy.get('[data-testid="amount-input"]').type('invalid');
    cy.get('[data-testid="from-currency-select"]').select('USD');
    cy.get('[data-testid="to-currency-select"]').select('Tether (USDT)');
    
    cy.get('[data-testid="convert-button"]').click();
    
    cy.get('[data-testid="result"]').should('contain', 'Please enter a valid number.');
  });
});

describe('User Details Page', () => {
  beforeEach(() => {
    // Mock localStorage to simulate a logged-in user
    const validDummyToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                            'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.' +
                            'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    cy.window().then(win => {
      win.localStorage.setItem('token', validDummyToken);
    });

    // Mock the API response for fetching user profile
    cy.intercept('GET', '**/user/profile', {
      body: {
        _id: 'user123',
        name: 'Test User',
        email: 'testuser@example.com',
        publicKey: 'publicKey123',
        initialBalance: 1000,
        comments: [],
        posts: [
          {
            id: 'post1',
            title: 'Post 1',
            content: 'Description of post 1',
            createdAt: '2023-01-01T00:00:00.000Z',
            author: 'user123'
          },
          {
            id: 'post2',
            title: 'Post 2',
            content: 'Description of post 2',
            createdAt: '2023-01-02T00:00:00.000Z',
            author: 'user123'
          }
        ]
      }
    }).as('fetchUserProfile');

    // Mock the API response for updating the password
    cy.intercept('PUT', '**/user/update-password', {
      statusCode: 200,
      body: {
        msg: 'Password updated successfully'
      }
    }).as('updatePassword');

    // Mock the API response for deleting a post
    cy.intercept('DELETE', '**/posts/*', {
      statusCode: 200
    }).as('deletePost');

    cy.visit('/userdetails');
  });

  it('should display the user details', () => {
    cy.wait('@fetchUserProfile');
    cy.get('[data-testid="user-details-heading"]').should('contain', 'User Details');
    cy.get('[data-testid="user-name"]').should('contain', 'Test User');
    cy.get('[data-testid="user-email"]').should('contain', 'testuser@example.com');
    cy.get('[data-testid="user-publicKey"]').should('contain', 'publicKey123');
  });

  it('should update the password', () => {
    cy.get('[data-testid="update-password-button"]').click();
    cy.get('[data-testid="current-password-input"]').type('currentpassword');
    cy.get('[data-testid="new-password-input"]').type('newpassword');
    cy.get('[data-testid="confirm-new-password-input"]').type('newpassword');
    cy.get('[data-testid="submit-password-button"]').click();
    cy.wait('@updatePassword');
    cy.get('[data-testid="password-update-message"]').should('contain', 'Password updated successfully');
  });

  it('should show error if new password and confirm new password do not match', () => {
    cy.get('[data-testid="update-password-button"]').click();
    cy.get('[data-testid="current-password-input"]').type('currentpassword');
    cy.get('[data-testid="new-password-input"]').type('newpassword1');
    cy.get('[data-testid="confirm-new-password-input"]').type('newpassword2');
    cy.get('[data-testid="submit-password-button"]').click();
    cy.get('[data-testid="password-update-message"]').should('contain', 'New password and confirm new password do not match.');
  });
});