import React from 'react';
import { StyleSheet, View } from 'react-native';
import { slidesProps } from 'lib/types';

type SlidesFooterProps = {
  activeIndex: number;
  slides: slidesProps[];
};

export default function SlidesFooter({
  activeIndex,
  slides,
}: SlidesFooterProps) {
  {
    return (
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  footer: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E9ECEF',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#8B5CF6',
    width: 20,
  },
});
