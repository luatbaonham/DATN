# sau khi tạo mới population lần 2 thì 2 gen đầu sẻ k cần tính lại vì nó mặc đinh lấy 2 gen tốt nhất r
## hỏi AI https://gemini.google.com/app/2c79a88d53207bb4?hl=vi

### khởi tạo quần thể củ
```
 private initializePopulation(): Chromosome[] {
    const population: Chromosome[] = [];
    const examGroupIds = Array.from(this.studentsByExamGroup.keys());

    if (this.timeSlots.length === 0) {
      throw new Error('Không có kíp thi hợp lệ để xếp lịch.');
    }

    for (let i = 0; i < POPULATION_SIZE; i++) {
      const chromosome: Chromosome = examGroupIds.map((examGroupId) => ({
        examGroupId,
        roomId:
          this.rooms[Math.floor(Math.random() * this.rooms.length)].roomId,
        // Chọn 1 kíp thi ngẫu nhiên từ danh sách HỢP LỆ
        timeSlotId:
          this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)].id,
        proctorId:
          this.proctors[Math.floor(Math.random() * this.proctors.length)]
            .proctorId,
      }));
      population.push(chromosome);
    }
    return population;
  }
  ```

  ## mutation củ
  ```
  
  private mutate(chromosome: Chromosome): Chromosome {
    const geneToMutateIndex = Math.floor(Math.random() * chromosome.length);
    const mutationType = Math.floor(Math.random() * 3);

    switch (mutationType) {
      case 0:
        chromosome[geneToMutateIndex].roomId =
          this.rooms[Math.floor(Math.random() * this.rooms.length)].roomId;
        break;
      case 1:
        // Đột biến kíp thi (chọn kíp khác từ danh sách hợp lệ)
        chromosome[geneToMutateIndex].timeSlotId =
          this.timeSlots[Math.floor(Math.random() * this.timeSlots.length)].id;
        break;
      case 2:
        chromosome[geneToMutateIndex].proctorId =
          this.proctors[
            Math.floor(Math.random() * this.proctors.length)
          ].proctorId;
        break;
    }
    return chromosome;
  }

  ```