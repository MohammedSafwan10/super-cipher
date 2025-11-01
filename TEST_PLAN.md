# Super Cipher Test Plan

## Features to Test

### 1. Security Modes
- [ ] **High Security** - Should show 5 algorithms (AES, RSA, Hill, Vigenère, Blowfish)
- [ ] **Balanced** - Should show 3 algorithms (AES, Hill, Vigenère)
- [ ] **Lightweight** - Should show 2 algorithms (Caesar, Vigenère)

### 2. Key Generation
- [ ] Click "Generate Keys" button
- [ ] Verify all algorithms get unique keys
- [ ] Check Caesar key format: "SHIFT-X"
- [ ] Check Hill key format: Matrix representation
- [ ] Check Vigenère key format: Uppercase letters
- [ ] Check AES/Blowfish key format: Hexadecimal
- [ ] Check RSA key format: JSON with publicKey/privateKey

### 3. Encryption Flow
#### Test Encryption:
1. Select security mode
2. Generate keys
3. Enter plaintext: "Hello World Test 123"
4. Click "Encrypt"
5. Verify:
   - [ ] Ciphertext appears in output
   - [ ] Encryption layers visualization appears
   - [ ] Each layer shows algorithm, order, and key
   - [ ] Performance metrics update
   - [ ] History entry added

#### Test Decryption:
1. Use the ciphertext from encryption
2. Keep the same keys
3. Click "Decrypt" mode
4. Click "Decrypt" button
5. Verify:
   - [ ] Original plaintext recovered
   - [ ] Decryption layers visualization appears
   - [ ] Performance metrics update
   - [ ] History entry added

### 4. Key Generation Info
- [ ] Toggle "Show/Hide Key Generation Details"
- [ ] Verify info panel shows for each algorithm
- [ ] Check descriptions are correct for each security mode

### 5. Download Features
- [ ] Download Result - saves encrypted/decrypted text
- [ ] Save Keys - downloads all keys in readable format

### 6. Caesar Cipher Specific Tests
- [ ] Lightweight mode includes Caesar cipher
- [ ] Caesar encryption works with shift
- [ ] Caesar decryption recovers original text
- [ ] Non-alphabetic characters preserved

### 7. Multi-Layer Tests
#### High Security (5 layers):
```
Plaintext: "Test"
Layer 1: AES encrypt
Layer 2: RSA encrypt (Layer 1 output)
Layer 3: Hill encrypt (Layer 2 output)
Layer 4: Vigenère encrypt (Layer 3 output)
Layer 5: Blowfish encrypt (Layer 4 output)
Result: Final ciphertext

Decryption (reverse order):
Layer 1: Blowfish decrypt
Layer 2: Vigenère decrypt
Layer 3: Hill decrypt
Layer 4: RSA decrypt
Layer 5: AES decrypt
Result: "Test" recovered
```

### 8. Performance Metrics
- [ ] Encryption time displayed
- [ ] Memory usage tracked
- [ ] Throughput calculated
- [ ] Metrics update in real-time

### 9. History
- [ ] Each operation logged
- [ ] Shows algorithm, timestamp, size
- [ ] Displays layer information
- [ ] Clear history works

### 10. Mobile Responsiveness
- [ ] Layout adapts to small screens
- [ ] All buttons accessible
- [ ] Text areas usable
- [ ] Visualizations scale properly

## Known Limitations

1. **RSA Encryption Size**: RSA can only encrypt data smaller than key size. For large texts, you may get errors. This is expected behavior.

2. **Hill Cipher**: Only works with alphabetic characters. Non-alphabetic characters are handled but may not encrypt properly.

3. **Browser Memory API**: `performance.memory` may not be available in all browsers (Firefox). Memory tracking will show 0 in such cases.

## Test Results

Date: [To be filled]
Tester: [To be filled]

| Test Case | Status | Notes |
|-----------|--------|-------|
| High Security Mode | | |
| Balanced Mode | | |
| Lightweight Mode | | |
| Key Generation | | |
| Encryption | | |
| Decryption | | |
| Caesar Cipher | | |
| Visual Flow | | |
| Download Results | | |
| Download Keys | | |
| Performance Metrics | | |
| History Logging | | |
| Mobile View | | |
