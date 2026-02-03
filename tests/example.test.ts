// Basic proof-of-concept test to verify Jest is working

describe('Jest Setup Verification', () => {
  it('should pass a simple assertion', () => {
    expect(true).toBe(true);
  });

  it('should handle basic math operations', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
  });

  it('should work with arrays', () => {
    const numbers = [1, 2, 3];
    expect(numbers).toHaveLength(3);
    expect(numbers).toContain(2);
  });

  it('should work with objects', () => {
    const user = { name: 'Test User', age: 25 };
    expect(user).toHaveProperty('name');
    expect(user.age).toBe(25);
  });
});
