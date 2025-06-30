import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundColor: '#fff',
  backgroundGradientFrom: '#f1f1f1',
  backgroundGradientTo: '#f1f1f1',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(66, 194, 244, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const data = [
  { name: 'A', value: 400, color: '#e6194b', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  { name: 'B', value: 300, color: '#3cb44b', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  { name: 'C', value: 200, color: '#ffe119', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  { name: 'D', value: 278, color: '#4363d8', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  { name: 'E', value: 189, color: '#f58231', legendFontColor: '#7F7F7F', legendFontSize: 12 },
];

const uvData = {
  labels: data.map((d) => d.name),
  datasets: [
    {
      data: data.map((d) => d.value),
    },
  ],
};

export default function Visualise({ onSelectChart }) {
  const getChart = (type) => {
    switch (type) {
      case 0:
        return (
          <LineChart
            data={uvData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
          />
        );
      case 1:
        return (
          <BarChart
            data={uvData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
          />
        );
      case 2:
        return (
          <PieChart
            data={data}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        );
      default:
        return (
          <View style={styles.customBox}>
            <Text style={styles.customText}>Custom Box</Text>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {Array.from({ length: 6 }).map((_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onSelectChart(getChart(i % 3))}
          style={styles.chartWrapper}
        >
          {getChart(i % 3)}
          <Text style={styles.label}>Chart {i + 1}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  chartWrapper: {
    marginBottom: 20,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    padding: 10,
    elevation: 2,
  },
  label: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
  customBox: {
    width: screenWidth - 40,
    height: 200,
    backgroundColor: '#e6194b',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  customText: {
    color: '#fff',
    fontSize: 18,
  },
});
