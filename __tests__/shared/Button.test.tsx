import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

import { Button } from '../../src/shared/components/Button';

describe('Button', () => {
  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="اختبار" onPress={onPress} />);

    fireEvent.press(getByText('اختبار'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="تعطيل" onPress={onPress} disabled />);

    fireEvent.press(getByText('تعطيل'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows loader when loading', () => {
    const { getByRole } = render(<Button title="تحميل" onPress={() => {}} loading />);

    expect(getByRole('progressbar')).toBeTruthy();
  });
});

